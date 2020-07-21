//@flow
import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import { useSelector } from "react-redux"
import WizardFooter from "./WizardComponents/WizardFooter"
import WizardFrontpageStep from "./WizardSteps/WizardFrontpageStep"
import WizardCreateFolderStep from "./WizardSteps/WizardCreateFolderStep"
import WizardAddObjectStep from "./WizardSteps/WizardAddObjectStep"
import WizardShowSummaryStep from "./WizardSteps/WizardShowSummaryStep"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    alignItems: "stretch",
  },
  paperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
}))

const getStepContent = wizardStep => {
  switch (wizardStep) {
    case -1:
      return <WizardFrontpageStep />
    case 0:
      return <WizardCreateFolderStep />
    case 1:
      return <WizardAddObjectStep />
    case 2:
      return <WizardShowSummaryStep />
    default:
      throw new Error("Unknown step")
  }
}

const NewDraftWizard = () => {
  const classes = useStyles()
  const wizardStep = useSelector(state => state.wizardStep)

  return (
    <Container maxWidth={wizardStep <= 0 ? "md" : "lg"}>
      <Paper className={classes.paper}>
        <div className={classes.paperContent}>{getStepContent(wizardStep)}</div>
        <WizardFooter />
      </Paper>
    </Container>
  )
}

export default NewDraftWizard
