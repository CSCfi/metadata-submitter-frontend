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
 * @param wizardStep: Step to render
 * @param nextButtonRef: Mutable ref object from useRef-hook
 */

const getStepContent = (wizardStep: number, nextButtonRef: ElementRef<typeof Formik>) => {
  switch (wizardStep) {
    case -1:
      return <WizardFrontpageStep nextButtonRef={nextButtonRef} />
    case 0:
      return <WizardCreateFolderStep nextButtonRef={nextButtonRef} />
    case 1:
      return <WizardAddObjectStep nextButtonRef={nextButtonRef} />
    case 2:
      return <WizardShowSummaryStep nextButtonRef={nextButtonRef} />
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
    <Container maxWidth="false" className={classes.container}>
      <Paper className={wizardStep < 0 ? classes.paperFirstStep : classes.paper} elevation={wizardStep < 0 ? 2 : 0}>
        <div className={classes.paperContent}>{getStepContent(wizardStep, nextButtonRef)}</div>
      </Paper>
      <WizardFooter nextButtonRef={nextButtonRef} />
    </Container>
  )
}

export default NewDraftWizard
