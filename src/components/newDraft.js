//@flow
import React, { useState } from "react"
import { withStyles, makeStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import Button from "@material-ui/core/Button"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import Tooltip from "@material-ui/core/Tooltip"
import { Link as RouterLink } from "react-router-dom"
import Link from "@material-ui/core/Link"
import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    minHeight: "40vh",
  },
  paperTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(8),
  },
  paperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  newDraftButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
  submitNewObjectRow: {
    display: "inline-flex",
  },
  stepper: {
    display: "inline-flex",
  },
  submitNewObjectTip: {
    marginLeft: theme.spacing(2),
  },
  cancelButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}))

const NewObjectTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: theme.typography.pxToRem(14),
    boxShadow: theme.shadows[1],
  },
}))(Tooltip)

const NewDraftFolderContent = () => {
  const classes = useStyles()
  return (
    <div className={classes.paperContent}>
      <Typography
        component="h1"
        variant="subtitle1"
        className={classes.paperTitle}
      >
        Create new draft folder
      </Typography>
      <div className={classes.stepper}>
        <Stepper activeStep={0} alternativeLabel>
          <Step key={1}>
            <StepLabel>Name & description</StepLabel>
          </Step>
          <Step key={2}>
            <StepLabel>Add objects</StepLabel>
          </Step>
          <Step key={3}>
            <StepLabel>Summary</StepLabel>
          </Step>
        </Stepper>
      </div>
    </div>
  )
}

type DraftProps = {
  handleNext: string => void,
}

const NewDraftFront = ({ handleNext }: DraftProps) => {
  const classes = useStyles()
  const submitObjectHelpText =
    "Objects are usually part of some folder, but if you don't yet know whether to put your object into a folder, you can submit it individually"
  return (
    <div className={classes.paperContent}>
      <Typography
        component="h1"
        variant="subtitle1"
        className={classes.paperTitle}
      >
        Create new draft
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.newDraftButton}
        disableElevation
        onClick={handleNext}
      >
        New folder
      </Button>
      <div className={classes.submitNewObjectRow}>
        <Typography
          component="h2"
          variant="subtitle1"
          className={classes.paperTitle}
        >
          Or do you want to submit object?
        </Typography>
        <NewObjectTooltip title={submitObjectHelpText} arrow>
          <HelpOutlineIcon className={classes.submitNewObjectTip} />
        </NewObjectTooltip>
      </div>
    </div>
  )
}

const NewDraft = () => {
  const classes = useStyles()
  const [wizardStep, setWizardStep] = useState(-1)
  const maxWidth = "md"

  const handleNext = () => {
    setWizardStep(wizardStep + 1)
  }

  return (
    <Container maxWidth={maxWidth}>
      <Paper className={classes.paper}>
        {wizardStep === -1 && <NewDraftFront handleNext={handleNext} />}
        {wizardStep === 0 && <NewDraftFolderContent handleNext={handleNext} />}
        <div>
          <Link
            component={RouterLink}
            aria-label="Cancel adding a new draft"
            to="/"
          >
            <Button
              variant="contained"
              color="secondary"
              className={classes.cancelButton}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </Paper>
    </Container>
  )
}

export default NewDraft
