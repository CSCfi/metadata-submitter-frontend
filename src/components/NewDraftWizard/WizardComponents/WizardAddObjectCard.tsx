import React from "react"

import Card from "@mui/material/Card"
import { makeStyles } from "@mui/styles"

import WizardFillObjectDetailsForm from "components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import WizardUploadObjectXMLForm from "components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { useAppSelector } from "hooks"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    marginBottom: theme.spacing(4),
    padding: 0,
    overflow: "visible",
  },
  submissionTypeButton: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  hideButton: {
    color: theme.palette.common.white,
    marginTop: 0,
  },
}))

/*
 * Render correct form to add objects based on submission type in store
 */
const WizardAddObjectCard: React.FC<any> = () => {
  const classes = useStyles()
  const submissionType = useAppSelector(state => state.submissionType)
  const objectType = useAppSelector(state => state.objectType)

  const cards = {
    [ObjectSubmissionTypes.form]: {
      component: <WizardFillObjectDetailsForm key={objectType + submissionType} />,
      testId: ObjectSubmissionTypes.form,
    },
    [ObjectSubmissionTypes.xml]: {
      component: <WizardUploadObjectXMLForm key={objectType + submissionType} />,
      testId: ObjectSubmissionTypes.xml,
    },
  }

  return (
    <Card className={classes.card} data-testid={cards[submissionType]["testId"]}>
      {cards[submissionType]["component"]}
    </Card>
  )
}

export default WizardAddObjectCard