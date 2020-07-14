//@flow
import React from "react"
import { useDispatch } from "react-redux"

import CardContent from "@material-ui/core/CardContent"
import ListItemText from "@material-ui/core/ListItemText"
import ListItem from "@material-ui/core/ListItem"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import { makeStyles } from "@material-ui/core/styles"

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

const ObjectIndexCard = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectTypes = [
    "study",
    "sample",
    "experiment",
    "run",
    "analysis",
    "dac",
    "policy",
    "dataset",
  ]

  return (
    <Card className={classes.card}>
      <CardHeader title="Create new draft" />
      <CardContent className={classes.content}>
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

export default ObjectIndexCard
