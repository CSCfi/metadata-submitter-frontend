//@flow
import React, { useState } from "react"
import { useDispatch } from "react-redux"

import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/core/styles"

import UploadObjectXMLForm from "components/NewDraftWizard/WizardForms/UploadObjectXMLForm"
import FillObjectDetailsForm from "components/NewDraftWizard/WizardForms/FillObjectDetailsForm"
import { resetObjectType } from "features/objectTypeSlice"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
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
          onClick={() => dispatch(resetObjectType())}
        >
          Hide
        </Button>
      }
    />
  )
}

type ChooseProps = {
  setSubmissionType: string => void,
  buttonContents: Array<{ type: string, title: string }>,
}

const ChooseSubmission = ({ setSubmissionType, buttonContents }: ChooseProps) => {
  const classes = useStyles()
  return (
    <div>
      <CustomCardHeader title="Choose type of submission" />
      <CardContent className={classes.cardContent}>
        {buttonContents.map(content => (
          <Button
            key={content.type}
            variant="outlined"
            color="primary"
            onClick={() => setSubmissionType(content.type)}
            className={classes.submissionTypeButton}
          >
            {content.title}
          </Button>
        ))}
      </CardContent>
    </div>
  )
}

const AddObjectCard = () => {
  const classes = useStyles()
  const [submissionType, setSubmissionType] = useState("")
  const cards = {
    form: {
      title: "Fill form",
      component: <FillObjectDetailsForm />,
    },
    xml: {
      title: "Upload XML file",
      component: <UploadObjectXMLForm />,
    },
    existing: {
      title: "Choose existing object",
      component: <UploadObjectXMLForm />,
    },
  }
  return (
    <Card className={classes.card}>
      {submissionType === "" ? (
        <ChooseSubmission
          setSubmissionType={value => setSubmissionType(value)}
          buttonContents={Object.keys(cards).map(key => ({
            type: key,
            title: cards[key].title,
          }))}
        />
      ) : (
        <>
          <CustomCardHeader title={cards[submissionType]["title"]} />
          <CardContent className={classes.cardContent}>{cards[submissionType]["component"]}</CardContent>
        </>
      )}
    </Card>
  )
}

export default AddObjectCard
