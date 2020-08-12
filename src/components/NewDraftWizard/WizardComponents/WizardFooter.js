//@flow
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "@material-ui/core/Link"
import { Link as RouterLink } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { resetWizard } from "features/wizardStepSlice"
import { resetObjectType } from "features/objectTypeSlice"
import { resetFolder } from "features/submissionFolderSlice"
import { makeStyles } from "@material-ui/core/styles"

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
  return (
    <div>
      <div className={classes.phantom} />
      <div className={classes.footerRow}>
        <div>
          <Link component={RouterLink} aria-label="Cancel creating a new submission" to="/">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                dispatch(resetWizard())
                dispatch(resetFolder())
                dispatch(resetObjectType())
              }}
              className={classes.footerButton}
            >
              Cancel
            </Button>
          </Link>
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
    </div>
  )
}

export default WizardFooter
