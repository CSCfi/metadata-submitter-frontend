//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { decrement } from "features/wizardStepSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import objectAPIService from "services/objectAPI"

const useStyles = makeStyles(() => ({
  buttonEdit: {
    color: "#007bff",
  },
  buttonDelete: {
    color: "#dc3545",
  },
}))

const WizardSavedObjectActions = (props: any) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const currentObject = useSelector(state => state.currentObject)

  const handleObjectEdit = async () => {
    const response = await objectAPIService.getObjectByAccessionId(props.objectType, props.objectId)
    if (response.ok) {
      dispatch(
        setCurrentObject({
          ...response.data,
          type: "saved",
          tags: props.tags,
          index: props.submissions.findIndex(item => item.accessionId === props.objectId),
        })
      )
      dispatch(setSubmissionType(props.submissionType))

      if (props.summary) {
        dispatch(setObjectType(props.objectType))
        dispatch(decrement())
      }
    } else {
      dispatch(
        updateStatus({
          successStatus: "error",
          response: response,
          errorPrefix: "Object fetching error",
        })
      )
    }
  }

  const handleObjectDelete = () => {
    dispatch(deleteObjectFromFolder("submitted", props.objectId, props.objectType)).catch(error => {
      dispatch(
        updateStatus({
          successStatus: "error",
          response: error,
          errorPrefix: "Can't delete object",
        })
      )
    })

    if (
      props.submissions.filter(item => item.tags.submissionType === props.submissionType).length - 1 === 0 &&
      currentObject.tags.submissionType === props.submissionType
    ) {
      dispatch(resetCurrentObject())
    }

    if (currentObject.accessionId === props.objectId) dispatch(resetCurrentObject())
  }

  return (
    <ButtonGroup aria-label="Draft actions button group">
      <Button className={classes.buttonEdit} aria-label="Edit submission" onClick={() => handleObjectEdit()}>
        {props.submissionType === "form" ? "Edit" : "Replace"}
      </Button>
      <Button className={classes.buttonDelete} aria-label="Delete submission" onClick={() => handleObjectDelete()}>
        Delete
      </Button>
    </ButtonGroup>
  )
}

export default WizardSavedObjectActions
