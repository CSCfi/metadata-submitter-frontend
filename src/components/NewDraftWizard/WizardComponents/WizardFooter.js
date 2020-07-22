//@flow
import React from "react"
import type { ElementRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "@material-ui/core/Link"
import { Link as RouterLink } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { decrement, increment, reset } from "../../../features/wizardStepSlice"
import { makeStyles } from "@material-ui/core/styles"
import { Formik } from "formik"

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

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Define wizard footer with changing button actions.
 *
 * Cancel button quits the whole wizard process.
 * Back button decrements wizard steps by one
 * Next button increments wizard steps by one and acts as a Formik form
 * submitter when nextButtonRef is set (e.g. is not null).
 *
 * @param nextButtonRef: Mutable ref object from useRef-hook
 */

const WizardFooter = ({ nextButtonRef }: nextButtonRefProp) => {
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
      {wizardStep >= 0 && (
        <Button
          variant="contained"
          color="primary"
          className={classes.nextButton}
          disabled={nextButtonRef?.current?.isSubmitting}
          onClick={async () => {
            if (nextButtonRef.current) {
              await nextButtonRef.current.submitForm()
            }
            if (
              wizardStep !== 2 &&
              (!nextButtonRef.current ||
                Object.entries(nextButtonRef.current.errors).length === 0)
            ) {
              dispatch(increment())
            }
          }}
        >
          {wizardStep === 2 ? "Save draft" : "Next"}
        </Button>
      )}
    </div>
  )
}

export default WizardFooter
