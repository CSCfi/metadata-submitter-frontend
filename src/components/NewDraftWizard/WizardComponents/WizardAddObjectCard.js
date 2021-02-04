//@flow
import React, { useRef, useEffect } from "react"

import Card from "@material-ui/core/Card"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import WizardDraftObjectPicker from "components/NewDraftWizard/WizardComponents/WizardDraftObjectPicker"
import WizardFillObjectDetailsForm from "components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import WizardUploadObjectXMLForm from "components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(4),
    padding: 0,
  },
  cardCenterContent: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "40vh",
    border: "1px solid blue",
    padding: 0,
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
const WizardAddObjectCard = () => {
  const classes = useStyles()
  const submissionType = useSelector(state => state.submissionType)
  const objectType = useSelector(state => state.objectType)
  const cards = {
    form: {
      component: <WizardFillObjectDetailsForm key={objectType + submissionType} />,
      testId: "form",
    },
    xml: {
      component: <WizardUploadObjectXMLForm key={objectType + submissionType} />,
      testId: "xml",
    },
    existing: {
      component: <WizardDraftObjectPicker />,
      testId: "existing",
    },
  }
  return (
    <Card className={classes.card} data-testid={cards[submissionType]["testId"]}>
      {cards[submissionType]["component"]}
    </Card>
  )
}

export default WizardAddObjectCard
