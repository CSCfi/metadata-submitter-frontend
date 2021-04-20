//@flow
import React, { useState } from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Collapse from "@material-ui/core/Collapse"
import IconButton from "@material-ui/core/IconButton"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableRow from "@material-ui/core/TableRow"
import Typography from "@material-ui/core/Typography"
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import { useSelector } from "react-redux"

import { formatDisplayObjectType, getDraftObjects, getItemPrimaryText } from "utils"

const useStyles = makeStyles(theme => ({
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
  table: { padding: 0, margin: theme.spacing(1, 0) },
  schemaTitle: {
    color: theme.palette.grey[900],
    padding: theme.spacing(1),
    textTransform: "capitalize",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    border: `0.1rem solid ${theme.palette.secondary.main}`,
    borderRadius: "0.125rem",
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  listItems: {
    border: "none",
  },
  collapse: {
    border: `0.1rem solid ${theme.palette.secondary.main}`,
    padding: theme.spacing(1),
    borderRadius: "0.125rem",
  },
  listItemText: {
    padding: 0,
    margin: theme.spacing(1, 0),
    borderBottom: `solid 0.1rem ${theme.palette.secondary.main}`,
    "&:last-child": {
      border: "none",
    },
  },
}))

const UserDraftTemplates = (): React$Element<any> => {
  const classes = useStyles()
  const user = useSelector(state => state.user)
  const objectsArray = useSelector(state => state.objectsArray)

  const draftObjects = getDraftObjects(user.drafts, objectsArray)

  // Render when there is user's draft template(s)
  const DraftList = () => (
    <Table className={classes.table}>
      <TableBody>
        {draftObjects.map(draft => {
          const schema = Object.keys(draft)[0]
          const [open, setOpen] = useState(false)

          return (
            <React.Fragment key={schema}>
              <TableRow onClick={() => setOpen(!open)}>
                <TableCell className={classes.schemaTitle}>
                  <Typography display="inline" variant="subtitle1">
                    {formatDisplayObjectType(schema)}
                  </Typography>
                  <IconButton aria-label="expand row" size="small">
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="none" className={classes.listItems}>
                  <Collapse className={classes.collapse} in={open} timeout={{ enter: 150, exit: 150 }} unmountOnExit>
                    {draft[schema].map(item => (
                      <ListItemText
                        className={classes.listItemText}
                        key={item.accessionId}
                        primary={getItemPrimaryText(item)}
                        secondary={item.accessionId}
                        data-schema={item.schema}
                      />
                    ))}
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          )
        })}
      </TableBody>
    </Table>
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
        title={"Your Draft Templates"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
      />
      {draftObjects.length > 0 ? <DraftList /> : <EmptyList />}
    </Card>
  )
}

export default UserDraftTemplates
