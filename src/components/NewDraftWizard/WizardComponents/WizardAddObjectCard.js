//@flow
import React, { useRef, useEffect } from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import WizardDraftObjectPicker from "components/NewDraftWizard/WizardComponents/WizardDraftObjectPicker"
import WizardFillObjectDetailsForm from "components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import WizardUploadObjectXMLForm from "components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"
import { resetFocus } from "features/focusSlice"
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
  cardCenterContent: {
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
  const focusTarget = useRef(null)
  const shouldFocus = useSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

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
            dispatch(resetFocus())
          }}
          ref={focusTarget}
          onBlur={() => dispatch(resetFocus())}
          focusRipple={shouldFocus}
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
  const objectType = useSelector(state => state.objectType)
  const cards = {
    form: {
      title: "Fill form",
      component: <WizardFillObjectDetailsForm key={objectType + submissionType} />,
      testId: "form",
    },
    xml: {
      title: "Upload XML file",
      component: <WizardUploadObjectXMLForm key={objectType + submissionType} />,
      testId: "xml",
    },
    existing: {
      title: "Choose from drafts",
      component: <WizardDraftObjectPicker />,
      testId: "existing",
    },
  }
  return (
    <Card className={classes.card} data-testid={cards[submissionType]["testId"]}>
      <CustomCardHeader title={cards[submissionType]["title"]} />
      <CardContent className={submissionType === "xml" ? classes.cardCenterContent : ""}>
        {cards[submissionType]["component"]}
      </CardContent>
    </Card>
  )
}

export default WizardAddObjectCard
