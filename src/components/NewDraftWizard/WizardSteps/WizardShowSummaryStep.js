//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import type { ElementRef } from "react"
import { Formik } from "formik"

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = ({ nextButtonRef }: nextButtonRefProp) => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper nextButtonRef={nextButtonRef} />
      <WizardHeader headerText="Summary" />
    </>
  )
}

export default WizardShowSummaryStep
