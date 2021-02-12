//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"
import { useHistory, Link as RouterLink } from "react-router-dom"

import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import WizardAlert from "./WizardAlert"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetWizard } from "features/wizardStepSlice"
import { deleteFolderAndContent, publishFolderContent, resetFolder } from "features/wizardSubmissionFolderSlice"

const useStyles = makeStyles(theme => ({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
    borderTop: "solid 1px #ccc",
    backgroundColor: "#FFF",
    position: "fixed",
    zIndex: 1,
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
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")
  let history = useHistory()

  const resetDispatch = () => {
    history.push("/home")
    dispatch(resetWizard())
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handleAlert = alertWizard => {
    setConnError(false)
    if (alertWizard && alertType === "cancel") {
      dispatch(deleteFolderAndContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          setConnError(true)
          setResponseError(JSON.parse(error.response))
          setErrorPrefix(error.message)
        })
    } else if (alertWizard && alertType === "save") {
      resetDispatch()
    } else if (alertWizard && alertType === "publish") {
      dispatch(publishFolderContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          setConnError(true)
          setResponseError(JSON.parse(error))
          setErrorPrefix(`Couldn't publish folder with id ${folder.id}`)
        })
    } else {
      setDialogOpen(false)
    }
    setDialogOpen(false)
  }

  const disablePublishButton = () => {
    if (wizardStep !== 2) {
      return true
    }
    if (wizardStep === 2) {
      const { metadataObjects } = folder
      if (metadataObjects.length === 0) {
        return true
      }
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
              disabled={disablePublishButton()}
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
      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </div>
  )
}

export default WizardFooter
