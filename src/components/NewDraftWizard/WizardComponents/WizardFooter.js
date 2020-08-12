//@flow
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "@material-ui/core/Link"
import { Link as RouterLink } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { resetWizard } from "features/wizardStepSlice"
import { resetObjectType } from "features/objectTypeSlice"
import { deleteFolderAndContent } from "features/submissionFolderSlice"
import { makeStyles } from "@material-ui/core/styles"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogActions from "@material-ui/core/DialogActions"

const useStyles = makeStyles(theme => ({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
    borderTop: "solid 1px #ccc",
    backgroundColor: "white",
    position: "fixed",
    left: 0,
    bottom: 0,
    padding: "10px",
    height: "60px",
    width: "100%",
  },
  footerButton: {
    margin: theme.spacing(0, 2),
  },
  phantom: {
    display: "block",
    padding: "20px",
    height: "60px",
    width: "100%",
  },
}))

const CancelDialog = ({ open, handleCancel }: { open: boolean, handleCancel: boolean => void }) => (
  <Dialog
    open={open}
    onClose={() => handleCancel(false)}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{"Cancel creating a submission folder?"}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        If you cancel creating submission folder, the folder and its content will not be saved anywhere.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={() => handleCancel(false)} color="primary" autoFocus>
        No, continue creating the folder
      </Button>
      <Link component={RouterLink} aria-label="Cancel a new folder and move to frontpage" to="/">
        <Button variant="contained" onClick={() => handleCancel(true)} color="primary">
          Yes, cancel creating folder
        </Button>
      </Link>
    </DialogActions>
  </Dialog>
)

/**
 * Define wizard footer with changing button actions.
 */
const WizardFooter = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const wizardStep = useSelector(state => state.wizardStep)
  const folder = useSelector(state => state.submissionFolder)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const handleCancel = cancelWizard => {
    if (cancelWizard) {
      console.log("here!")
      dispatch(resetWizard())
      dispatch(resetObjectType())
      dispatch(deleteFolderAndContent(folder))
    } else {
      setCancelDialogOpen(false)
    }
  }

  return (
    <div>
      <div className={classes.phantom} />
      <div className={classes.footerRow}>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setCancelDialogOpen(true)}
            className={classes.footerButton}
          >
            Cancel
          </Button>
        </div>
        {wizardStep >= 0 && (
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={wizardStep < 1}
              className={classes.footerButton}
              onClick={() => {
                console.log("This should save and exit!")
              }}
            >
              Save and Exit
            </Button>
            <Button
              variant="contained"
              disabled={wizardStep !== 2}
              onClick={() => {
                console.log("This should publish!")
              }}
            >
              Publish
            </Button>
          </div>
        )}
      </div>
      <CancelDialog open={cancelDialogOpen} handleCancel={handleCancel} />
    </div>
  )
}

export default WizardFooter
