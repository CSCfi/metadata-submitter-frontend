//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import type { ElementRef } from "react"
import { Formik } from "formik"
import { useSelector } from "react-redux"

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = ({ nextButtonRef }: nextButtonRefProp) => {
  const folder = useSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper nextButtonRef={nextButtonRef} />
      <WizardHeader headerText="Summary" />
      <ul>
        {metadataObjects.map(object => (
          <li key={object.accessionId}>
            {object.schema} - {object.accessionId}
          </li>
        ))}
      </ul>
    </>
  )
}

export default WizardShowSummaryStep
