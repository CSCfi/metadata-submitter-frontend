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
    margin: theme.spacing(0, 1),
  },
  phantom: {
    display: "block",
    padding: "20px",
    height: "60px",
    width: "100%",
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
    <div>
      <div className={classes.phantom} />
      <div className={classes.footerRow}>
        <div>
          <Link component={RouterLink} aria-label="Cancel creating a new submission" to="/">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => dispatch(reset())}
              className={classes.footerButton}
            >
              Cancel
            </Button>
          </Link>
          {wizardStep >= 1 && (
            <Button variant="contained" color="primary" onClick={() => dispatch(decrement())}>
              Back
            </Button>
          )}
        </div>
        {wizardStep >= 0 && (
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={nextButtonRef?.current?.isSubmitting}
              className={classes.footerButton}
              onClick={async () => {
                if (nextButtonRef.current) {
                  await nextButtonRef.current.submitForm()
                }
                if (
                  wizardStep !== 2 &&
                  (!nextButtonRef.current || Object.entries(nextButtonRef.current.errors).length === 0)
                ) {
                  dispatch(increment())
                }
              }}
            >
              Save and Exit
            </Button>
            <Button variant="contained" disabled={wizardStep === 2 ? false : true}>
              Publish
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WizardFooter
