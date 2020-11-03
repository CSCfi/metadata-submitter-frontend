//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"
import { Link as RouterLink } from "react-router-dom"

import WizardAlert from "./WizardAlert"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetWizard } from "features/wizardStepSlice"
import { deleteFolderAndContent } from "features/wizardSubmissionFolderSlice"
import { publishFolderContent } from "features/wizardSubmissionFolderSlice"

const useStyles = makeStyles(theme => ({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
    borderTop: "solid 1px #ccc",
    backgroundColor: "#FFF",
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

  const handleAlert = alertWizard => {
    if (alertWizard && alertType === "cancel") {
      dispatch(resetWizard())
      dispatch(resetObjectType())
      dispatch(deleteFolderAndContent(folder))
    } else if (alertWizard && alertType === "save") {
      dispatch(resetWizard())
    } else if (alertWizard && alertType === "publish") {
      dispatch(resetWizard())
      dispatch(publishFolderContent(folder))
    } else {
      setDialogOpen(false)
    }
  }

  return (
    <div>
      <div className={classes.phantom} />
      <div className={classes.footerRow}>
        <div>
          {wizardStep < 0 && (
            <Link component={RouterLink} aria-label="Cancel at the pre-step and move to frontpage" to="/home">
              <Button variant="contained" color="secondary" className={classes.footerButton}>
                Cancel
              </Button>
            </Link>
          )}
          {wizardStep >= 0 && (
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
          )}
        </div>
        {wizardStep >= 0 && (
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={wizardStep < 1}
              className={classes.footerButton}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("save")
              }}
            >
              Save and Exit
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={wizardStep !== 2}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("publish")
              }}
            >
              Publish
            </Button>
          </div>
        )}
      </div>
      {dialogOpen && <WizardAlert onAlert={handleAlert} parentLocation="footer" alertType={alertType}></WizardAlert>}
    </div>
  )
}

export default WizardFooter
