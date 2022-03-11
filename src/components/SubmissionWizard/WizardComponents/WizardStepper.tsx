import React, { useState } from "react"

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import Check from "@mui/icons-material/Check"
import Button from "@mui/material/Button"
import Step from "@mui/material/Step"
import StepConnector from "@mui/material/StepConnector"
import StepLabel from "@mui/material/StepLabel"
import Stepper from "@mui/material/Stepper"
import { makeStyles, withStyles } from "@mui/styles"
import clsx from "clsx"
import { useNavigate, useParams } from "react-router-dom"

import WizardAlert from "./WizardAlert"

import { resetDraftStatus } from "features/draftStatusSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { useQuery, pathWithLocale } from "utils"
/*
 * Customized stepper inspired by https://material-ui.com/components/steppers/#customized-stepper
 */
const QontoConnector = withStyles(theme => ({
  alternativeLabel: {
    top: 10,
    left: `calc(-50% + ${8})`,
    right: `calc(50% + ${8})`,
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
    boxShadow: "0",
  },
}))

function QontoStepIcon(props: { active: boolean; completed: boolean }) {
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
    marginTop: 50,
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

const WizardStepper = ({
  createFolderFormRef,
}: {
  createFolderFormRef?: { current: HTMLElement | null } | undefined
}) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const steps = ["Folder Name & Description", "Add Objects", "Summary"]
  const formState = useAppSelector(state => state.submissionType)
  const [alert, setAlert] = useState(false)
  const [direction, setDirection] = useState("")
  const draftStatus = useAppSelector(state => state.draftStatus)
  const navigate = useNavigate()
  const params = useParams()

  const folderId = params.folderId
  const newDraftPath = pathWithLocale(`submission/${folderId}`)

  const queryParams = useQuery()
  const wizardStep = Number(queryParams.get("step"))

  const unsavedSubmission = wizardStep === 1 && formState.trim().length > 0 && draftStatus === "notSaved"

  const handleNavigation = (step: boolean) => {
    setDirection("")
    setAlert(false)
    dispatch(resetDraftStatus())

    if (step) {
      direction === "previous" ? navigate(-1) : navigate({ pathname: newDraftPath, search: "step=2" })
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
        disabled={wizardStep < 1}
        onClick={() => {
          if (unsavedSubmission) {
            setDirection("previous")
            setAlert(true)
          } else {
            navigate({ pathname: newDraftPath, search: `step=${wizardStep - 1}` })
          }
        }}
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
      <Button
        disabled={wizardStep >= 2}
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        onClick={async () => {
          if (createFolderFormRef?.current) {
            await createFolderFormRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
          }
          if (unsavedSubmission) {
            setDirection("next")
            setAlert(true)
          } else if (wizardStep !== 2 && !createFolderFormRef?.current) {
            navigate({ pathname: newDraftPath, search: "step=2" })
          }
        }}
      >
        Next
        <ArrowForwardIosIcon fontSize="large" />
      </Button>
      {wizardStep === 1 && alert && (
        <WizardAlert onAlert={handleNavigation} parentLocation="stepper" alertType={direction}></WizardAlert>
      )}
    </div>
  )
}

export default WizardStepper
