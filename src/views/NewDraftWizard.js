//@flow
import React, { useRef } from "react"

import Container from "@material-ui/core/Container"
import Paper from "@material-ui/core/Paper"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"
import { useHistory } from "react-router-dom"

import WizardFooter from "components/NewDraftWizard/WizardComponents/WizardFooter"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import WizardAddObjectStep from "components/NewDraftWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateFolderStep from "components/NewDraftWizard/WizardSteps/WizardCreateFolderStep"
import WizardFrontpageStep from "components/NewDraftWizard/WizardSteps/WizardFrontpageStep"
import WizardShowSummaryStep from "components/NewDraftWizard/WizardSteps/WizardShowSummaryStep"
import type { CreateFolderFormRef } from "types"
import { useQuery } from "utils"
import Page404 from "views/ErrorPages/Page404"

const useStyles = makeStyles(theme => ({
  paper: {
    alignItems: "stretch",
  },
  paperFirstStep: {
    padding: theme.spacing(4),
    alignItems: "stretch",
    width: "60%",
    margin: theme.spacing(10, "auto"),
  },
  paperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  container: {
    flex: "1 0 auto",
    padding: 0,
  },
}))

/**
 * Return correct content for each step
 */
const getStepContent = (wizardStep: number, createFolderFormRef: CreateFolderFormRef) => {
  switch (wizardStep) {
    case -1:
      return <WizardFrontpageStep />
    case 0:
      return <WizardCreateFolderStep createFolderFormRef={createFolderFormRef} />
    case 1:
      return <WizardAddObjectStep />
    case 2:
      return <WizardShowSummaryStep />
    default:
      return <Page404 />
  }
}

/**
 * Container for wizard, renders content for each wizard step.
 *
 * Some children components need to hook extra functionalities to "next step"-button, so reference hook it set here.
 */
const NewDraftWizard = (): React$Element<typeof Container> => {
  const classes = useStyles()
  const history = useHistory()
  const queryParams = useQuery()

  const step = queryParams.get("step")

  let wizardStep = step ? Number(step) : -1

  const statusDetails = useSelector(state =>
    state.statusDetails ? JSON.parse(state.statusDetails) : state.statusDetails
  )
  const createFolderFormRef = useRef<null | (HTMLFormElement & { changeCallback: Function })>(null)

  // Fallback if no folder in state
  const folder = useSelector(state => state.submissionFolder)

  if (!folder && (wizardStep === 1 || wizardStep === 2)) {
    wizardStep = -1
    history.push({ pathname: "/newdraft" })
  }

  return (
    <Container maxWidth={false} className={classes.container}>
      <Paper className={wizardStep < 0 ? classes.paperFirstStep : classes.paper} elevation={wizardStep < 0 ? 2 : 0}>
        <div className={classes.paperContent}>{getStepContent(wizardStep, createFolderFormRef)}</div>
      </Paper>
      {statusDetails && (
        <WizardStatusMessageHandler
          successStatus={statusDetails.successStatus}
          response={statusDetails.response}
          prefixText={statusDetails.errorPrefix}
        />
      )}
      <WizardFooter />
    </Container>
  )
}

export default NewDraftWizard
