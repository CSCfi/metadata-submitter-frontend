//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Link from "@material-ui/core/Link"
import { Link as RouterLink } from "react-router-dom"

const CancelFormDialog = ({
  open,
  handleCancelling,
  alertType,
  parentLocation,
}: {
  open: boolean,
  handleCancelling: boolean => void,
  alertType: string,
  parentLocation: string,
}) => {
  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions
  switch (parentLocation) {
    case "submission": {
      switch (alertType) {
        case "form": {
          dialogTitle = "Would you like to save draft version of this form"
          dialogContent = "If you save form as a draft, you can continue filling it later."
          break
        }
        case "xml": {
          dialogTitle = "Would you like to save draft version of this xml upload"
          dialogContent = "If you save xml as a draft, you can upload it later."
          break
        }
        case "existing": {
          dialogTitle = "Would you like to save draft version of this existing object upload"
          dialogContent = "If you save object as a draft, you can upload it later."
          break
        }
        default: {
          dialogTitle = "default"
          dialogContent = "default content"
        }
      }
      dialogActions = (
        <DialogActions>
          <Button variant="contained" onClick={() => handleCancelling(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleCancelling(true)} color="primary">
            Do not save
          </Button>
          <Button variant="contained" onClick={() => handleCancelling(true)} color="primary">
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
              <Button variant="outlined" onClick={() => handleCancelling(false)} color="primary" autoFocus>
                No, continue creating the folder
              </Button>
              <Link component={RouterLink} aria-label="Cancel a new folder and move to frontpage" to="/home">
                <Button variant="contained" onClick={() => handleCancelling(true)} color="primary">
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
              <Link component={RouterLink} aria-label="Cancel a new folder and move to frontpage" to="/home">
                <Button variant="contained" onClick={() => handleCancelling(true)} color="primary">
                  Return to listing
                </Button>
              </Link>
            </DialogActions>
          )
          break
        }
      }
      break
    }
    case "stepper": {
      break
    }
    default: {
      dialogTitle = "default"
      dialogContent = "default content"
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => handleCancelling(false)}
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
const FormAlert = ({
  handleCancel,
  parentLocation,
  alertType,
}: {
  handleCancel: boolean => void,
  parentLocation: string,
  alertType: string,
}) => {
  const [alertForm, setAlertFormOpen] = useState(true)

  const handleCancelling = (cancel: boolean) => {
    setAlertFormOpen(false)
    handleCancel(cancel)
  }

  return (
    <div>
      <CancelFormDialog
        open={alertForm}
        handleCancelling={handleCancelling}
        alertType={alertType}
        parentLocation={parentLocation}
      />
    </div>
  )
}

export default FormAlert
