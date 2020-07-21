//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSteps from "../WizardComponents/WizardSteps"

const WizardCreateFolderStep = () => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardSteps />
    </>
  )
}

export default WizardCreateFolderStep
