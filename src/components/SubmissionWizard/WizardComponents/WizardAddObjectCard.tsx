import React from "react"

import Card from "@mui/material/Card"
import { makeStyles } from "@mui/styles"

import WizardFillObjectDetailsForm from "components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
// import WizardUploadObjectXMLForm from "components/SubmissionWizard/WizardForms/WizardUploadObjectXMLForm"
import WizardXMLObjectPage from "components/SubmissionWizard/WizardForms/WizardXMLObjectPage"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { useAppSelector } from "hooks"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    padding: 0,
    overflow: "visible",
  },
  submissionTypeButton: {
    paddingTop: 2,
    paddingBottom: 2,
    marginLeft: 4,
    marginRight: 4,
  },
  hideButton: {
    color: theme.palette.common.white,
    marginTop: 0,
  },
}))

/*
 * Render correct form to add objects based on submission type in store
 */
const WizardAddObjectCard: React.FC = () => {
  const classes = useStyles()
  const submissionType = useAppSelector(state => state.submissionType)
  const objectType = useAppSelector(state => state.objectType)

  const cards = {
    [ObjectSubmissionTypes.form]: {
      component: <WizardFillObjectDetailsForm key={objectType + submissionType} />,
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
        <Card className={classes.card} data-testid={cards[submissionType]["testId"]}>
          {cards[submissionType]["component"]}
        </Card>
      )}
    </>
  )
}

export default WizardAddObjectCard
