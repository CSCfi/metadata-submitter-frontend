//@flow
import React, { useRef } from "react"
import type { ElementRef } from "react"
import { Formik } from "formik"
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

/**
 * Return correct content for each step
 * @param wizardStep: Step to render
 * @param nextButtonRef: Mutable ref object from useRef-hook
 */

const getStepContent = (wizardStep: number, nextButtonRef: ElementRef<typeof Formik>) => {
  switch (wizardStep) {
    case -1:
      return <WizardFrontpageStep />
    case 0:
      return <WizardCreateFolderStep nextButtonRef={nextButtonRef} />
    case 1:
      return <WizardAddObjectStep />
    case 2:
      return <WizardShowSummaryStep />
    default:
      throw new Error("Unknown step")
  }
}

/**
 * Container for new draft wizard, renders content for each wizard page. This
 * includes on-linear steps such as adding just one metadata object.
 *
 * Some children components need to hook extra functionalities to footers next-
 * button, so reference hook it set here.
 */
const NewDraftWizard = () => {
  const classes = useStyles()
  const wizardStep = useSelector(state => state.wizardStep)
  const nextButtonRef = useRef<Formik>(null)

  return (
    <Container maxWidth={wizardStep <= 0 ? "md" : "lg"}>
      <Paper className={classes.paper}>
        <div className={classes.paperContent}>{getStepContent(wizardStep, nextButtonRef)}</div>
        <WizardFooter nextButtonRef={nextButtonRef} />
      </Paper>
    </Container>
  )
}

export default NewDraftWizard
