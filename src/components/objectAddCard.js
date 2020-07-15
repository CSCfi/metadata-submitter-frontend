//@flow
import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"

import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/core/styles"

import UploadXMLForm from "forms/uploadXMLForm"
import FillObjectDetailsForm from "forms/fillObjectDetailsForm"
import { setObjectType } from "features/objectTypeSlice"

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
}))

type ChooseProps = {
  setSubmissionType: string => void,
}

const ChooseSubmission = ({ setSubmissionType }: ChooseProps) => (
  <div>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => setSubmissionType("form")}
    >
      Fill Form
    </Button>
    <span>or</span>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => setSubmissionType("xml")}
    >
      Upload XML file
    </Button>
  </div>
)

const ObjectAddCard = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { objectType } = useSelector(state => state.objectType)
  const [submissionType, setSubmissionType] = useState("default")
  const submissionTypes = {
    form: {
      subheader: "Fill form",
      component: <FillObjectDetailsForm />,
    },
    xml: {
      subheader: "Upload XML file",
      component: <UploadXMLForm />,
    },
    default: {
      subheader: "Choose type of submission",
      component: (
        <ChooseSubmission
          setSubmissionType={value => setSubmissionType(value)}
        />
      ),
    },
  }
  return (
    <Card>
      <CardHeader
        title={objectType}
        subheader={submissionTypes[submissionType]["subheader"]}
      />
      <CardContent className={classes.cardContent}>
        {submissionTypes[submissionType]["component"]}
      </CardContent>
      <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
    </Card>
  )
}

export default ObjectAddCard
