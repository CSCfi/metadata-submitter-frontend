//@flow
import React, { useState, useEffect } from "react"

import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { useDispatch, useSelector } from "react-redux"

import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"

import WizardDraftSelections from "./WizardDraftSelections"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setAlert, resetAlert } from "features/wizardAlertSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideFolderWithTags } from "types"

// Simple template for error messages
const ErrorMessage = message => {
  return <Alert severity="error">{message.message}</Alert>
}

/*
 * Dialog contents are rendered based on parent component location and alert type
 */
const CancelFormDialog = ({
  handleDialog,
  alertType,
  parentLocation,
  currentSubmissionType,
}: {
  handleDialog: (boolean, formData?: Array<ObjectInsideFolderWithTags>) => void,
  alertType: string,
  parentLocation: string,
  currentSubmissionType: string,
}) => {
  const submissionFolder = useSelector(state => state.submissionFolder)
  const currentObject = useSelector(state => state.currentObject)
  const objectType = useSelector(state => state.objectType)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const dispatch = useDispatch()

  // Draft save logic
  const saveDraft = async () => {
    setError(false)

    const handleSave = await saveDraftHook(
      currentObject.accessionId || currentObject.objectId,
      objectType,
      currentObject.status,
      submissionFolder,
      currentObject.cleanedValues || currentObject,
      dispatch
    )

    if (handleSave.ok) {
      handleDialog(true)
    } else {
      setError(true)
      setErrorMessage("Connection error, cannot save draft.")
    }
  }

  const updateForm = async () => {
    const err = "Connection error, cannot update object"
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
      setErrorMessage(err)
    }
  }

  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions
  const formContent = "If you save form as a draft, you can continue filling it later."
  const xmlContent = "If you save xml as a draft, you can upload it later."
  const objectContent = "If you save object as a draft, you can upload it later."

  switch (parentLocation) {
    case "submission": {
      if (currentObject?.status === ObjectStatus.submitted) {
        dialogTitle = "Would you like to save edited form data?"
        dialogContent = "Unsaved changes will be lost. If you save form as a draft, you can continue filling it later."
        dialogActions = (
          <DialogActions>
            <Button variant="contained" onClick={() => handleDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
              Do not save
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                saveDraft()
              }}
              color="primary"
            >
              Save as a draft
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                updateForm()
              }}
              color="primary"
            >
              Update
            </Button>
          </DialogActions>
        )
      } else {
        switch (alertType) {
          case ObjectSubmissionTypes.form: {
            dialogTitle = "Would you like to save draft version of this form"
            dialogContent = formContent
            break
          }
          case ObjectSubmissionTypes.xml: {
            dialogTitle = "Would you like to save draft version of this xml upload"
            dialogContent = xmlContent
            break
          }
          case ObjectSubmissionTypes.existing: {
            dialogTitle = "Would you like to save draft version of this existing object upload"
            dialogContent = objectContent
            break
          }
          default: {
            dialogTitle = "default"
            dialogContent = "default content"
          }
        }
        dialogActions = (
          <DialogActions>
            <Button variant="contained" onClick={() => handleDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
              Do not save
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                saveDraft()
              }}
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        )
      }

      break
    }
    case "footer": {
      switch (alertType) {
        case "cancel": {
          dialogTitle = "Cancel creating a submission folder?"
          dialogContent =
            "If you cancel creating submission folder, the folder and its content will not be saved anywhere."
          dialogActions = (
            <DialogActions>
              <Button variant="outlined" onClick={() => handleDialog(false)} color="primary" autoFocus>
                No, continue creating the folder
              </Button>
              <Button
                variant="contained"
                aria-label="Cancel a new folder and move to frontpage"
                onClick={() => handleDialog(true)}
                color="primary"
              >
                Yes, cancel creating folder
              </Button>
            </DialogActions>
          )
          break
        }
        case "save": {
          dialogTitle = "Folder saved"
          dialogContent = "Folder has been saved"
          dialogActions = (
            <DialogActions style={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                aria-label="Save a new folder and move to frontpage"
                onClick={() => handleDialog(true)}
                color="primary"
              >
                Return to homepage
              </Button>
            </DialogActions>
          )
          break
        }
        case "publish": {
          dialogTitle = "Publishing objects"
          dialogContent =
            submissionFolder?.drafts.length > 0
              ? "Objects in this folder will be published. Please choose the drafts you would like to save, unsaved drafts will be removed from this folder."
              : "Objects in this folder will be published."
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
    case "stepper": {
      dialogTitle = "Move to " + alertType + " step?"
      dialogContent = "You have unsaved data. You can save current form as draft"
      switch (currentSubmissionType) {
        case ObjectSubmissionTypes.form: {
          dialogContent = formContent
          break
        }
        case ObjectSubmissionTypes.xml: {
          dialogContent = xmlContent
          break
        }
        case ObjectSubmissionTypes.existing: {
          dialogContent = objectContent
          break
        }
        default: {
          dialogContent = "default content"
        }
      }
      dialogActions = (
        <DialogActions>
          <Button variant="contained" onClick={() => handleDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
            Navigate without saving
          </Button>
          <Button variant="contained" onClick={() => saveDraft()} color="primary">
            Save and navigate
          </Button>
        </DialogActions>
      )
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
  onAlert: (boolean, formData?: Array<ObjectInsideFolderWithTags>) => any,
  parentLocation: string,
  alertType: string,
}): React$Element<any> => {
  const currentSubmissionType = useSelector(state => state.submissionType)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setAlert())
  }, [])

  const handleDialog = (action: boolean, formData?: Array<ObjectInsideFolderWithTags>) => {
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
