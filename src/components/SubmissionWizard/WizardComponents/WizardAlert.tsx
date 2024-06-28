import React, { useState, useEffect } from "react"

import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { useTranslation } from "react-i18next"

import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"

import WizardDraftSelections from "./WizardDraftSelections"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setAlert, resetAlert } from "features/wizardAlertSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideSubmissionWithTags } from "types"

// Simple template for error messages
const ErrorMessage = (props: { message: string }) => {
  return <Alert severity="error">{props.message}</Alert>
}

/*
 * Dialog contents are rendered based on parent component location and alert type
 */
const CancelFormDialog = ({
  handleDialog,
  alertType,
  parentLocation,
}: {
  handleDialog: (status: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => void
  alertType?: string
  parentLocation: string
  currentSubmissionType: string
}) => {
  const submission = useAppSelector(state => state.submission)
  const currentObject = useAppSelector(state => state.currentObject)
  const objectType = useAppSelector(state => state.objectType)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const dispatch = useAppDispatch()

  // Draft save logic
  const saveDraft = async () => {
    setError(false)

    const handleSave = await saveDraftHook({
      accessionId: currentObject.accessionId || currentObject.objectId,
      objectType: objectType,
      objectStatus: currentObject.status,
      submission: submission,
      values: currentObject.cleanedValues || currentObject,
      dispatch: dispatch,
    })

    if (handleSave.ok) {
      handleDialog(true)
    } else {
      setError(true)
      setErrorMessage(t("errors.connection.saveDraft"))
    }
  }

  const updateForm = async () => {
    const response = await objectAPIService.patchFromJSON(
      objectType,
      currentObject.accessionId,
      currentObject.cleanedValues
    )
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        updateStatus({
          status: ResponseStatus.success,
          response: response,
          helperText: "",
        })
      )
      dispatch(resetCurrentObject())
      handleDialog(true)
    } else {
      setError(true)
      setErrorMessage(t("errors.connection.updateObject"))
    }
  }

  const { t } = useTranslation()
  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions

  switch (parentLocation) {
    case "submission": {
      // Text depends on ObjectStatus or ObjectSubmissionType
      const textType =
        currentObject?.status === ObjectStatus.submitted ? "submitted" : alertType?.toLowerCase()
      dialogTitle = t(`${"alerts." + textType + ".title"}`)
      dialogContent = t(`${"alerts." + textType + ".content"}`)
      dialogActions = (
        <DialogActions>
          <Button variant="contained" onClick={() => handleDialog(false)} color="secondary">
            {t("alerts.actions.cancel")}
          </Button>
          <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
            {t("alerts.actions.noSave")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              saveDraft()
            }}
            color="primary"
          >
            {t("alerts.actions.saveDraft")}
          </Button>
          {textType === "submitted" && (
            <Button
              variant="contained"
              onClick={() => {
                updateForm()
              }}
              color="primary"
            >
              {t("alerts.actions.update")}
            </Button>
          )}
        </DialogActions>
      )
      break
    }
    case "header": {
      switch (alertType) {
        case "save": {
          dialogTitle = t("alerts.save.title")
          dialogContent = t("alerts.save.content")
          dialogActions = (
            <DialogActions style={{ justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={() => handleDialog(false)}
                color="primary"
                autoFocus
              >
                {t("alerts.actions.continueSubmission")}
              </Button>
              <Button
                variant="contained"
                aria-label="Save a new submission and move to frontpage"
                onClick={() => handleDialog(true)}
                color="primary"
              >
                {t("alerts.actions.saveExit")}
              </Button>
            </DialogActions>
          )
          break
        }
        case "publish": {
          // publish alert might not originate from header, move later
          dialogTitle = t("alerts.publish.title")
          dialogContent =
            submission?.drafts.length > 0
              ? t("alerts.publish.content.objects") + t("alerts.publish.content.chooseDrafts")
              : t("alerts.publish.content.objects")
          dialogActions = <WizardDraftSelections onHandleDialog={handleDialog} />
          break
        }
        default: {
          dialogTitle = "default"
          dialogContent = "default content"
        }
      }
      break
    }
    default: {
      dialogTitle = "default"
      dialogContent = "default content"
    }
  }

  return (
    <Dialog
      open={true}
      onClose={() => handleDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" data-testid="alert-dialog-content">
          {dialogContent}
        </DialogContentText>
      </DialogContent>
      {error && <ErrorMessage message={errorMessage} />}
      {dialogActions}
    </Dialog>
  )
}

/*
 * Render alert form based on location and type
 */
const WizardAlert = ({
  onAlert,
  parentLocation,
  alertType,
}: {
  onAlert: (status: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => void
  parentLocation: string
  alertType?: string
}) => {
  const currentSubmissionType = useAppSelector(state => state.submissionType)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setAlert())
  }, [dispatch])

  const handleDialog = (action: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => {
    dispatch(resetAlert())
    onAlert(action, formData)
  }

  return (
    <div>
      <CancelFormDialog
        handleDialog={handleDialog}
        alertType={alertType}
        parentLocation={parentLocation}
        currentSubmissionType={currentSubmissionType}
      />
    </div>
  )
}

export default WizardAlert
