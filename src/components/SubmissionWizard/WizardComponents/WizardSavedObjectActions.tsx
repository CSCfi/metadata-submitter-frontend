import React from "react"

import Button from "@mui/material/Button"
import ButtonGroup from "@mui/material/ButtonGroup"
import { useNavigate } from "react-router-dom"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus, ObjectTypes } from "constants/wizardObject"
import { deleteFileType } from "features/fileTypesSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { deleteObjectFromSubmission } from "features/wizardSubmissionSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideSubmissionWithTags, ObjectTags } from "types"

type WizardSavedObjectActionsProps = {
  objectId: string
  objectType: string
  submissionType: string
  submissions: Array<ObjectInsideSubmissionWithTags>
  tags: ObjectTags
  summary?: boolean
}

const WizardSavedObjectActions = (props: WizardSavedObjectActionsProps) => {
  const dispatch = useAppDispatch()
  const currentObject = useAppSelector(state => state.currentObject)

  const navigate = useNavigate()

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
        navigate(-1)
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
      deleteObjectFromSubmission(
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

    // Delete fileType that is equivalent to deleted object
    if (props.objectType === ObjectTypes.analysis || props.objectType === ObjectTypes.run) {
      dispatch(deleteFileType(props.objectId))
    }
  }

  const renderEditLabel = (submissionType: string) => {
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
        sx={{ color: theme => theme.palette.primary.main }}
        aria-label="Edit submission"
        onClick={() => (props.submissionType === "Draft" ? handleObjectContinue() : handleObjectEdit())}
        data-testid="Edit submission"
      >
        {renderEditLabel(props.submissionType)}
      </Button>
      <Button
        sx={{ color: theme => theme.palette.primary.main }}
        aria-label="Delete submission"
        onClick={() => handleObjectDelete()}
        data-testid="Delete submission"
      >
        Delete
      </Button>
    </ButtonGroup>
  )
}

export default WizardSavedObjectActions
