//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"

const WizardShowSummaryStep = () => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper />
      <WizardHeader headerText="Summary" />
    </>
  )
}

export default WizardShowSummaryStep
