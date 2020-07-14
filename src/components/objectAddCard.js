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

const ObjectAddCard = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { objectType } = useSelector(state => state.objectType)
  const [submissionType, setSubmissionType] = useState("")
  if (submissionType === "form") {
    return (
      <Card>
        <CardHeader title={`${objectType}`} subheader={"Fill Form"} />
        <CardContent className={classes.cardContent}>
          <FillObjectDetailsForm />
        </CardContent>
        <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
      </Card>
    )
  } else if (submissionType === "XML") {
    return (
      <Card>
        <CardHeader title={`${objectType}`} subheader={"Upload XML file"} />
        <CardContent className={classes.cardContent}>
          <UploadXMLForm />
        </CardContent>
        <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
      </Card>
    )
  } else {
    return (
      <Card>
        <CardHeader
          title={`${objectType}`}
          subheader={"Choose type of submission"}
        />
        <CardContent className={classes.cardContent}>
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
            onClick={() => setSubmissionType("XML")}
          >
            Upload XML file
          </Button>
        </CardContent>
        <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
      </Card>
    )
  }
}

export default ObjectAddCard
