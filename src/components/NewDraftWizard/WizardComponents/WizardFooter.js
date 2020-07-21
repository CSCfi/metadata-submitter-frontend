//@flow
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "@material-ui/core/Link"
import { Link as RouterLink } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { decrement, increment, reset } from "../../../features/wizardStepSlice"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  cancelButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  nextButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  backButton: {
    textTransform: "none",
    fontWeight: "bold",
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}))

const WizardFooter = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const wizardStep = useSelector(state => state.wizardStep)
  return (
    <div className={classes.footerRow}>
      <div>
        <Link
          component={RouterLink}
          aria-label="Cancel adding a new draft"
          to="/"
        >
          <Button
            variant="contained"
            color="secondary"
            className={classes.cancelButton}
            onClick={() => dispatch(reset())}
          >
            Cancel
          </Button>
        </Link>
        {wizardStep >= 1 && (
          <Button
            variant="contained"
            color="primary"
            className={classes.backButton}
            onClick={() => dispatch(decrement())}
          >
            Back
          </Button>
        )}
      </div>
      {wizardStep >= 0 && wizardStep < 2 && (
        <Button
          variant="contained"
          color="primary"
          className={classes.nextButton}
          onClick={() => dispatch(increment())}
        >
          Next
        </Button>
      )}
      {wizardStep === 2 && (
        <Button
          variant="contained"
          color="primary"
          className={classes.nextButton}
        >
          Save draft
        </Button>
      )}
    </div>
  )
}

export default WizardFooter
