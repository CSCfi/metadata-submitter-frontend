import React from "react"

import { styled } from "@mui/material/styles"

import WizardFillObjectDetailsForm from "components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
import WizardXMLObjectPage from "components/SubmissionWizard/WizardForms/WizardXMLObjectPage"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { useAppSelector } from "hooks"
import type { FormRef } from "types"

const StyledContent = styled("div")(() => ({
  width: "100%",
  padding: 0,
  overflow: "visible",
}))

/*
 * Render correct form to add objects based on submission type in store
 */
const WizardAddObjectCard = ({ formRef }: { formRef?: FormRef }) => {
  const submissionType = useAppSelector(state => state.submissionType)
  const objectType = useAppSelector(state => state.objectType)

  const content = {
    [ObjectSubmissionTypes.form]: {
      component: <WizardFillObjectDetailsForm key={objectType + submissionType} formRef={formRef} />,
      testId: ObjectSubmissionTypes.form,
    },
    [ObjectSubmissionTypes.xml]: {
      component: <WizardXMLObjectPage key={objectType + submissionType} />,
      testId: ObjectSubmissionTypes.xml,
    },
  }

  return (
    <>
      {submissionType && (
        <StyledContent data-testid={content[submissionType]["testId"]}>
          {content[submissionType]["component"]}
        </StyledContent>
      )}
    </>
  )
}

export default WizardAddObjectCard
