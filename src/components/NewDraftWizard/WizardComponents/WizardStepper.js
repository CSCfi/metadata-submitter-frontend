//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Step from "@material-ui/core/Step"
import StepConnector from "@material-ui/core/StepConnector"
import StepLabel from "@material-ui/core/StepLabel"
import Stepper from "@material-ui/core/Stepper"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import Check from "@material-ui/icons/Check"
import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { useHistory, useParams } from "react-router-dom"

import WizardAlert from "./WizardAlert"

import { resetDraftStatus } from "features/draftStatusSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetSubmissionType } from "features/wizardSubmissionTypeSlice"
import type { CreateFolderFormRef } from "types"
/*
 * Customized stepper inspired by https://material-ui.com/components/steppers/#customized-stepper
 */
const QontoConnector = withStyles(theme => ({
  alternativeLabel: {
    top: 10,
    left: `calc(-50% + ${theme.spacing(2)})`,
    right: `calc(50% + ${theme.spacing(2)})`,
  },
  active: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    borderColor: theme.palette.secondary.main,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector)

const useQontoStepIconStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.secondary.main,
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: theme.palette.primary.main,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
  floating: {
    border: "solid 1px #000",
    backgroundColor: theme.palette.background.default,
    boxShadow: 0,
  },
}))

function QontoStepIcon(props: { active: boolean, completed: boolean }) {
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

/**
 * Show info about wizard steps to user.
 * If createFolderForm is passed as reference it is used to trigger correct form when clicking next.
 */
const WizardStepper = ({ createFolderFormRef }: { createFolderFormRef?: CreateFolderFormRef }): React$Element<any> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const steps = ["Folder Name & Description", "Add Objects", "Summary"]
  const formState = useSelector(state => state.submissionType)
  const [alert, setAlert] = useState(false)
  const [direction, setDirection] = useState("")
  const draftStatus = useSelector(state => state.draftStatus)
  const history = useHistory()
  const { step } = useParams()
  const urlStep = Number(step.toString().slice(-1))

  const handleNavigation = (step: boolean) => {
    setDirection("")
    setAlert(false)
    dispatch(resetDraftStatus())
    if (step) {
      direction === "previous" ? history.go(-1) : history.push({ pathname: "/newdraft/step2" })
      dispatch(resetObjectType())
      dispatch(resetSubmissionType())
    }
  }

  return (
    <div className={classes.stepper}>
      <Button
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        disabled={urlStep < 1}
        onClick={() => {
          if (urlStep === 1 && formState.trim().length > 0 && draftStatus === "notSaved") {
            setDirection("previous")
            setAlert(true)
          } else {
            history.go(-1)
          }
        }}
      >
        <ArrowBackIosIcon fontSize="large" />
        Back
      </Button>
      <Stepper
        activeStep={urlStep}
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
      <Button
        disabled={createFolderFormRef?.current?.isSubmitting || urlStep >= 2}
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        onClick={async () => {
          if (createFolderFormRef?.current) {
            await createFolderFormRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
          }
          if (urlStep === 1 && formState.trim().length > 0 && draftStatus === "notSaved") {
            setDirection("next")
            setAlert(true)
          } else if (urlStep !== 2 && !createFolderFormRef?.current) {
            history.push({ pathname: "/newdraft/step2" })
          }
        }}
      >
        Next
        <ArrowForwardIosIcon fontSize="large" />
      </Button>
      {urlStep === 1 && alert && (
        <WizardAlert onAlert={handleNavigation} parentLocation="stepper" alertType={direction}></WizardAlert>
      )}
    </div>
  )
}

export default WizardStepper
