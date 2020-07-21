//@flow
import React from "react"
import { useSelector } from "react-redux"
import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  stepper: {
    display: "flex",
    flexDirection: "row",
  },
})

const WizardStepper = () => {
  const classes = useStyles()
  const wizardStep = useSelector(state => state.wizardStep)
  const steps = ["Name & description", "Add objects", "Summary"]
  return (
    <div className={classes.stepper}>
      <Stepper activeStep={wizardStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}

export default WizardStepper
