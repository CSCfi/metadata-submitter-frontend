//@flow
import React from "react"
import clsx from "clsx"
import type { ElementRef } from "react"
import PropTypes from "prop-types"
import { useDispatch, useSelector } from "react-redux"
import Check from "@material-ui/icons/Check"
import Stepper from "@material-ui/core/Stepper"
import StepConnector from "@material-ui/core/StepConnector"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import Button from "@material-ui/core/Button"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import { decrement, increment } from "../../../features/wizardStepSlice"
import { Formik } from "formik"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"

// Customized stepper inspired by https://material-ui.com/components/steppers/#customized-stepper

const QontoConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  completed: {
    "& $line": {
      borderColor: "#784af4",
    },
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
})(StepConnector)

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: "#784af4",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
  floating: {
    border: "solid 1px #000",
    backgroundColor: "white",
    boxShadow: 0,
  },
})

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles()
  const { active, completed } = props

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
    </div>
  )
}

QontoStepIcon.propTypes = {
  /**
   * Whether this step is active.
   */
  active: PropTypes.bool,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool,
}

const useStyles = makeStyles({
  stepper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderBottom: "solid 1px #ccc",
  },
  stepperContainer: {
    width: "80%",
  },
  centeredStepButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    border: "none",
    width: "10%",
    backgroundColor: "rgba(139, 26, 79, 0.04)",
    "&:hover": {
      border: "none",
      backgroundColor: "rgba(139, 26, 79, 0.16)",
    },
    "&.Mui-disabled": {
      border: "none",
    },
  },
})

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Show info about wizard steps to user.
 */
const WizardStepper = ({ nextButtonRef }: nextButtonRefProp) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const wizardStep = useSelector(state => state.wizardStep)
  const steps = ["Folder Name & Description", "Add Objects", "Summary"]
  return (
    <div className={classes.stepper}>
      <Button
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        disabled={wizardStep < 1}
        onClick={() => dispatch(decrement())}
      >
        <ArrowBackIosIcon fontSize="large" />
        Back
      </Button>
      <Stepper
        activeStep={wizardStep}
        className={classes.stepperContainer}
        alternativeLabel
        connector={<QontoConnector />}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {wizardStep >= 0 && (
        <Button
          disabled={nextButtonRef?.current?.isSubmitting}
          className={classes.centeredStepButton}
          disableElevation
          color="primary"
          variant="outlined"
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
          Next
          <ArrowForwardIosIcon fontSize="large" />
        </Button>
      )}
    </div>
  )
}

export default WizardStepper
