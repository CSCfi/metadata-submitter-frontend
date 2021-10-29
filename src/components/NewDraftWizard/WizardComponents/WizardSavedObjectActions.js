//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideFolderWithTags, ObjectTags } from "types"

const useStyles = makeStyles(theme => ({
  buttonEdit: {
    color: theme.palette.button.edit,
  },
  buttonDelete: {
    color: theme.palette.button.delete,
  },
}))

type WizardSavedObjectActionsProps = {
  objectId: string,
  objectType: string,
  submissionType: string,
  submissions: Array<ObjectInsideFolderWithTags>,
  tags: ObjectTags,
  summary?: boolean,
}

const WizardSavedObjectActions = (props: WizardSavedObjectActionsProps): React$Element<typeof ButtonGroup> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const currentObject = useSelector(state => state.currentObject)
  const history = useHistory()

  const handleObjectEdit = async () => {
    const response = await objectAPIService.getObjectByAccessionId(props.objectType, props.objectId)

    if (response.ok) {
      dispatch(resetCurrentObject())
      dispatch(
        setCurrentObject({
          ...response.data,
          status: ObjectStatus.submitted,
          tags: props.tags,
          index: props.submissions.findIndex(item => item.accessionId === props.objectId),
        })
      )
      dispatch(setSubmissionType(props.submissionType))

      if (props.summary) {
        dispatch(setObjectType(props.objectType))
        history.go(-1)
      }
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Object fetching error",
        })
      )
    }
  }

  const handleObjectContinue = async () => {
    dispatch(resetCurrentObject())
    const response = await draftAPIService.getObjectByAccessionId(props.objectType, props.objectId)
    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, status: ObjectStatus.draft }))
      dispatch(setSubmissionType(ObjectSubmissionTypes.form))
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Draft fetching error",
        })
      )
    }
  }

  const handleObjectDelete = () => {
    dispatch(
      deleteObjectFromFolder(
        props.submissionType === "Draft" ? ObjectStatus.draft : ObjectStatus.submitted,
        props.objectId,
        props.objectType
      )
    ).catch(error => {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: error,
          helperText: "Can't delete object",
        })
      )
    })

    if (
      props.submissions.filter(item => item.tags?.submissionType === props.submissionType).length - 1 === 0 &&
      currentObject?.tags?.submissionType === props.submissionType
    ) {
      dispatch(resetCurrentObject())
    }

    if (currentObject.accessionId === props.objectId) dispatch(resetCurrentObject())
  }

  const renderEditLabel = submissionType => {
    switch (submissionType) {
      case ObjectSubmissionTypes.form: {
        return "Edit"
      }
      case ObjectStatus.draft: {
        return "Continue"
      }
      default: {
        return "Replace"
      }
    }
  }

  return (
    <ButtonGroup aria-label="Draft actions button group">
      <Button
        className={classes.buttonEdit}
        aria-label="Edit submission"
        onClick={() => (props.submissionType === "Draft" ? handleObjectContinue() : handleObjectEdit())}
      >
        {renderEditLabel(props.submissionType)}
      </Button>
      <Button className={classes.buttonDelete} aria-label="Delete submission" onClick={() => handleObjectDelete()}>
        Delete
      </Button>
    </ButtonGroup>
  )
}

export default WizardSavedObjectActions
