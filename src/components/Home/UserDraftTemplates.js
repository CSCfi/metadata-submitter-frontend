//@flow
import React, { useState } from "react"

// import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
// import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
// import Collapse from "@material-ui/core/Collapse"
// import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
// import TableCell from "@material-ui/core/TableCell"
// import TableRow from "@material-ui/core/TableRow"
import Typography from "@material-ui/core/Typography"
// import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
// import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import { useSelector } from "react-redux"

import { getDraftObjects, getItemPrimaryText, formatDisplayObjectType } from "utils"
// import { useHistory } from "react-router-dom"

// import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
// import { WizardStatus } from "constants/wizardStatus"

// import { updateStatus } from "features/wizardStatusMessageSlice"

const useStyles = makeStyles(theme => ({
  border: theme.palette.primary,
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "none",
    padding: theme.spacing(0),
  },
  cardTitle: {
    fontSize: "0.5em",
    padding: 0,
    marginTop: theme.spacing(1),
  },
  cardContent: { flexGrow: 1, padding: 0 },
  list: { padding: 0 },
  schemaTitle: {
    color: theme.palette.grey[900],
    padding: theme.spacing(1),
    textTransform: "capitalize",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  },
  collapse: {
    borderTop: `3px solid ${theme.palette.primary.main}`,
  },
  listItemText: {
    padding: 0,
    margin: theme.spacing(1, 0),
    borderBottom: `solid 1px ${theme.palette.secondary.main}`,
  },
}))

const UserDraftTemplates = (): React$Element<any> => {
  const classes = useStyles()
  const user = useSelector(state => state.user)
  const objectsArray = useSelector(state => state.objectsArray)

  const draftObjects = getDraftObjects(user.drafts, objectsArray)

  const [open, setOpen] = useState(false)

  // Render when there is user's draft template(s)
  const DraftList = () => (
    <CardContent className={classes.cardContent}>
      {draftObjects.map(draft => {
        const schema = Object.keys(draft)[0]
        return (
          <List key={schema} aria-label={schema} className={classes.list}>
            <div className={classes.schemaTitle} onClick={() => setOpen(!open)}>
              <Typography display="inline" variant="subtitle1" fontWeight="fontWeightBold">
                {formatDisplayObjectType(schema)}
              </Typography>
            </div>

            <div>
              {draft[schema].map(item => (
                <ListItemText
                  className={classes.listItemText}
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
