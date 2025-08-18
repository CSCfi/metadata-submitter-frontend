import { styled } from "@mui/material/styles"

import WizardFillObjectDetailsForm from "components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
// import WizardXMLObjectPage from "components/SubmissionWizard/WizardForms/WizardXMLObjectPage"
import { useAppSelector } from "hooks"
import type { HandlerRef } from "types"

const StyledContent = styled("div")(() => ({
  width: "100%",
  padding: 0,
  overflow: "visible",
}))

/*
 * Render correct form to add objects based on submission type in store
 */
const WizardAddObjectCard = ({ formRef }: { formRef?: HandlerRef }) => {
  const objectType = useAppSelector(state => state.objectType)

  const content = {
    component: <WizardFillObjectDetailsForm key={objectType} ref={formRef} />,
    testId: "form",
  }
  /* Redux's submissionType is removed:
    - To simplify the codes as the frontend doesn't support XML for MVP.
    - New StepObject has a prop "isXML" to check directly if XML otherwise Form. We can extend this feature.
  */
  // [ObjectSubmissionTypes.xml]: {
  //   component: <WizardXMLObjectPage key={objectType} />,
  //   testId: ObjectSubmissionTypes.xml,
  // },

  return <StyledContent data-testid={content["testId"]}>{content["component"]}</StyledContent>
}

export default WizardAddObjectCard
