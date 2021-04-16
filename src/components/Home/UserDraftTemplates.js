//@flow
import React from "react"

// import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
// import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import List from "@material-ui/core/List"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useSelector } from "react-redux"

import { getDraftObjects, getItemPrimaryText, formatDisplayObjectType } from "utils"
// import { useHistory } from "react-router-dom"

// import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
// import { WizardStatus } from "constants/wizardStatus"

// import { updateStatus } from "features/wizardStatusMessageSlice"

const useStyles = makeStyles(theme => ({
  border: theme.palette.primary,
  card: {},
  cardTitle: {},
  cardContent: {},
  list: {},
}))

// type UserDraftTemplatesProps = {

// }

const UserDraftTemplates = (): React$Element<any> => {
  const classes = useStyles()
  const user = useSelector(state => state.user)
  const objectsArray = useSelector(state => state.objectsArray)

  const draftObjects = getDraftObjects(user.drafts, objectsArray)
  console.log("draftObjects :>> ", draftObjects)
  //
  const DraftList = () => (
    <CardContent className={classes.cardContent}>
      {draftObjects.map(draft => {
        const schema = Object.keys(draft)[0]
        return (
          <List key={schema} aria-label={schema} className={classes.list}>
            <Typography variant="subtitle1" fontWeight="fontWeightBold">
              {formatDisplayObjectType(schema)}
            </Typography>
            <div>
              {draft[schema].map(item => (
                <ListItemText
                  key={item.accessionId}
                  primary={getItemPrimaryText(item)}
                  secondary={item.accessionId}
                  data-schema={item.schema}
                />
              ))}
            </div>
          </List>
        )
      })}
    </CardContent>
  )

  // Renders when user has no draft templates
  const EmptyList = () => (
    <CardContent className={classes.cardContent}>
      <Typography align="center" variant="body2">
        Currently there are no draft templates.
      </Typography>
    </CardContent>
  )
  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={"Your draft templates"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
      />
      {draftObjects.length > 0 ? <DraftList /> : <EmptyList />}
    </Card>
  )
}

export default UserDraftTemplates
