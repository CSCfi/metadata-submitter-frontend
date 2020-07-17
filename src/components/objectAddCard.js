//@flow
import React, { useState } from "react"
import { useDispatch } from "react-redux"

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
  cardHeader: {
    backgroundColor: theme.palette.grey[700],
    color: "white",
    fontWeight: "bold",
  },
  cardContent: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  submissionTypeButton: {
    maxWidth: "150px",
    padding: "10px",
    margin: "20px",
  },
}))

type ChooseProps = {
  setSubmissionType: string => void,
  buttonContents: Array<{ type: string, title: string }>,
}

const ChooseSubmission = ({
  setSubmissionType,
  buttonContents,
}: ChooseProps) => {
  const classes = useStyles()
  return (
    <div>
      <CardHeader
        title="Choose type of submission"
        titleTypographyProps={{ variant: "inherit" }}
        className={classes.cardHeader}
      />
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

const ObjectAddCard = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [submissionType, setSubmissionType] = useState("")
  const cards = {
    form: {
      title: "Fill form",
      component: <FillObjectDetailsForm />,
    },
    xml: {
      title: "Upload XML file",
      component: <UploadXMLForm />,
    },
    existing: {
      title: "Choose existing object",
      component: <UploadXMLForm />,
    },
  }
  if (submissionType === "") {
    return (
      <Card>
        <ChooseSubmission
          setSubmissionType={value => setSubmissionType(value)}
          buttonContents={Object.keys(cards).map(key => {
            return {
              type: key,
              title: cards[key].title,
            }
          })}
        />
        <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
      </Card>
    )
  } else {
    return (
      <Card>
        <CardHeader
          title={cards[submissionType]["title"]}
          titleTypographyProps={{ variant: "inherit" }}
          className={classes.cardHeader}
        />
        <CardContent className={classes.cardContent}>
          {cards[submissionType]["component"]}
        </CardContent>
        <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
      </Card>
    )
  }
}

export default ObjectAddCard
