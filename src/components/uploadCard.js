//@flow
import React from "react"
import { useSelector, useDispatch } from "react-redux"

import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import ListItemText from "@material-ui/core/ListItemText"
import ListItem from "@material-ui/core/ListItem"

import UploadXMLForm from "forms/uploadXMLForm"
import { setObjectType } from "features/objectTypeSlice"

const UploadFormCard = () => {
  const dispatch = useDispatch()
  const { objectType } = useSelector(state => state.objectType)
  return (
    <Card>
      <CardHeader
        title={`Submit ${objectType}`}
        subheader={"Upload an XML file"}
        titleTypographyProps={{ align: "center" }}
        subheaderTypographyProps={{ align: "center" }}
      />
      <CardContent>
        <UploadXMLForm />
      </CardContent>
      <Button onClick={() => dispatch(setObjectType(""))}>
        Back to choosing a submission
      </Button>
    </Card>
  )
}

const IndexCard = () => {
  const dispatch = useDispatch()
  const objectTypes = [
    "study",
    "project",
    "sample",
    "experiment",
    "run",
    "analysis",
    "dac",
    "policy",
    "dataset",
  ]

  return (
    <Card>
      <CardHeader title="Submit an object" />
      <CardContent>
        {objectTypes.map((type, index) => {
          const typeCapitalized = type[0].toUpperCase() + type.substring(1)
          return (
            <ListItem
              button
              onClick={() => dispatch(setObjectType(type))}
              key={index}
            >
              <ListItemText primary={typeCapitalized} />
            </ListItem>
          )
        })}
      </CardContent>
    </Card>
  )
}

const UploadCard = () => {
  const { objectType } = useSelector(state => state.objectType)
  return <div>{objectType === "" ? <IndexCard /> : <UploadFormCard />}</div>
}

export default UploadCard
