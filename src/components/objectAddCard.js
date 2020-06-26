//@flow
import React from "react"
import { useSelector, useDispatch } from "react-redux"

import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/core/styles"

import UploadXMLForm from "forms/uploadXMLForm"
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
  return (
    <Card>
      <CardHeader
        title={`Submit ${objectType}`}
        subheader={"Upload an XML file"}
      />
      <CardContent className={classes.cardContent}>
        <UploadXMLForm />
      </CardContent>
      <Button onClick={() => dispatch(setObjectType(""))}>Back</Button>
    </Card>
  )
}

export default ObjectAddCard
