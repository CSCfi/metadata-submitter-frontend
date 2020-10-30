//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Link from "@material-ui/core/Link"
import { useSelector } from "react-redux"
import { Link as RouterLink } from "react-router-dom"

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
  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions
  const formContent = "If you save form as a draft, you can continue filling it later."
  const xmlContent = "If you save xml as a draft, you can upload it later."
  const objectContent = "If you save object as a draft, you can upload it later."
  switch (parentLocation) {
    case "submission": {
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
          <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
            Save
          </Button>
        </DialogActions>
      )
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
              <Link component={RouterLink} aria-label="Cancel a new folder and move to frontpage" to="/home">
                <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
                  Yes, cancel creating folder
                </Button>
              </Link>
            </DialogActions>
          )
          break
        }
        case "save": {
          dialogTitle = "Folder saved"
          dialogContent = "Folder has been saved"
          dialogActions = (
            <DialogActions style={{ justifyContent: "center" }}>
              <Link component={RouterLink} aria-label="Save a new folder and move to frontpage" to="/home">
                <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
                  Return to homepage
                </Button>
              </Link>
            </DialogActions>
          )
          break
        }
        case "publish": {
          dialogTitle = "Objects published"
          dialogContent = "Compiled objects have been published"
          dialogActions = (
            <DialogActions style={{ justifyContent: "center" }}>
              <Link component={RouterLink} aria-label="Publish folder contents and move to frontpage" to="/home">
                <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
                  Return to homepage
                </Button>
              </Link>
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
          <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
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
  const handleDialog = (action: boolean) => {
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
