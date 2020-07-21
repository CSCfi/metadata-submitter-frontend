//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"

const WizardCreateFolderStep = () => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper />
    </>
  )
}

export default WizardCreateFolderStep
