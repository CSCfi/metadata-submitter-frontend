//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import WizardAlert from "./WizardAlert"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetWizard } from "features/wizardStepSlice"
import { deleteFolderAndContent } from "features/wizardSubmissionFolderSlice"

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

/**
 * Define wizard footer with changing button actions.
 */
const WizardFooter = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const wizardStep = useSelector(state => state.wizardStep)
  const folder = useSelector(state => state.submissionFolder)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertType, setAlertType] = useState("")

  const handleCancel = cancelWizard => {
    if (cancelWizard) {
      dispatch(resetWizard())
      dispatch(resetObjectType())
      dispatch(deleteFolderAndContent(folder))
    } else {
      setDialogOpen(false)
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
            onClick={() => {
              setDialogOpen(true)
              setAlertType("cancel")
            }}
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
              // TODO: Implement save functionality
              onClick={() => {
                setDialogOpen(true)
                setAlertType("save")
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
      {dialogOpen && <WizardAlert onAlert={handleCancel} parentLocation="footer" alertType={alertType}></WizardAlert>}
    </div>
  )
}

export default WizardFooter
