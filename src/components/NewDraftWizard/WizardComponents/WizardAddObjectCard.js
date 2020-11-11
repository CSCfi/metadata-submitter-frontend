//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import WizardFillObjectDetailsForm from "components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import WizardUploadObjectXMLForm from "components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetSubmissionType } from "features/wizardSubmissionTypeSlice"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: "#FFF",
    fontWeight: "bold",
  },
  cardHeaderAction: {
    marginTop: "-4px",
    marginBottom: "-4px",
  },
  cardContent: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "40vh",
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
 * Create header for form card with button to close the card
 */
const CustomCardHeader = ({ title }: { title: string }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  return (
    <CardHeader
      title={title}
      titleTypographyProps={{ variant: "inherit" }}
      classes={{
        root: classes.cardHeader,
        action: classes.cardHeaderAction,
      }}
      action={
        <Button
          variant="outlined"
          aria-label="hide card"
          className={classes.hideButton}
          onClick={() => {
            dispatch(resetObjectType())
            dispatch(resetSubmissionType())
          }}
        >
          Hide
        </Button>
      }
    />
  )
}

/*
 * Render correct form to add objects based on submission type in store
 */
const WizardAddObjectCard = () => {
  const classes = useStyles()
  const submissionType = useSelector(state => state.submissionType)
  const cards = {
    form: {
      title: "Fill form",
      component: <WizardFillObjectDetailsForm key={Math.floor(Math.random() * Math.floor(1000))} />, // Use random number as key, this destroys the component and prevents memory leaks. TODO: Use more convenient key
      testId: "form",
    },
    xml: {
      title: "Upload XML file",
      component: <WizardUploadObjectXMLForm key={Math.floor(Math.random() * Math.floor(1000))} />, // Use random number as key, this destroys the component and prevents memory leaks. TODO: Use more convenient key
      testId: "xml",
    },
    existing: {
      title: "Choose existing object",
      component: <div>Not implemented yet</div>,
      testId: "existing",
    },
  }
  return (
    <Card className={classes.card} data-testid={cards[submissionType]["testId"]}>
      <CustomCardHeader title={cards[submissionType]["title"]} />
      <CardContent className={classes.cardContent}>{cards[submissionType]["component"]}</CardContent>
    </Card>
  )
}

export default WizardAddObjectCard
