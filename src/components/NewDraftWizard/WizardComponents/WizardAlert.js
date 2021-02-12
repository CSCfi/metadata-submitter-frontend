//@flow
import React, { useState, useEffect } from "react"

import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Alert from "@material-ui/lab/Alert"
import { useDispatch, useSelector } from "react-redux"

import { resetDraftStatus } from "features/draftStatusSlice"
import { setAlert, resetAlert } from "features/wizardAlertSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToDrafts } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"

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
  handleDialog: boolean => void,
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
    const err = "Connection error, cannot save draft."

    if ((currentObject.accessionId || currentObject.objectId) && currentObject.type === "draft") {
      const response = await draftAPIService.patchFromJSON(
        objectType,
        currentObject.accessionId || currentObject.objectId,
        currentObject.cleanedValues
      )
      if (response.ok) {
        dispatch(resetDraftStatus())
        dispatch(
          updateStatus({
            successStatus: "success",
            response: response,
            errorPrefix: "",
          })
        )
        dispatch(resetCurrentObject())
        handleDialog(true)
      } else {
        setError(true)
        setErrorMessage(err)
      }
    } else {
      const response = await draftAPIService.createFromJSON(objectType, currentObject)
      if (response.ok) {
        dispatch(
          updateStatus({
            successStatus: "success",
            response: response,
            errorPrefix: "",
          })
        )
        dispatch(resetDraftStatus())
        dispatch(
          addObjectToDrafts(submissionFolder.id, {
            accessionId: response.data.accessionId,
            schema: "draft-" + objectType,
          })
        )
        dispatch(resetCurrentObject())
        handleDialog(true)
      } else {
        setError(true)
        setErrorMessage(err)
      }
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
          successStatus: "success",
          response: response,
          errorPrefix: "",
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
      if (currentObject?.type === "saved") {
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
          case "form": {
            dialogTitle = "Would you like to save draft version of this form"
            dialogContent = formContent
            break
          }
          case "xml": {
            dialogTitle = "Would you like to save draft version of this xml upload"
            dialogContent = xmlContent
            break
          }
          case "existing": {
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
            "Objects in this folder will be published. Publishing will remove saved drafts from this folder."
          dialogActions = (
            <DialogActions style={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                aria-label="Publish folder contents and move to frontpage"
                onClick={() => handleDialog(true)}
                color="primary"
              >
                Publish
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
      break
    }
    case "stepper": {
      dialogTitle = "Move to " + alertType + " step?"
      dialogContent = "You have unsaved data. You can save current form as draft"
      switch (currentSubmissionType) {
        case "form": {
          dialogContent = formContent
          break
        }
        case "xml": {
          dialogContent = xmlContent
          break
        }
        case "existing": {
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
        <DialogContentText id="alert-dialog-description">{dialogContent}</DialogContentText>
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
  onAlert: boolean => void,
  parentLocation: string,
  alertType: string,
}) => {
  const currentSubmissionType = useSelector(state => state.submissionType)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setAlert())
  }, [])

  const handleDialog = (action: boolean) => {
    dispatch(resetAlert())
    onAlert(action)
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
