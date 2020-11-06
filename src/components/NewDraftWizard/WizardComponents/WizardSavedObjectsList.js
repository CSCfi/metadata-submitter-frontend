//@flow
import React from "react"

import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import ClearIcon from "@material-ui/icons/Clear"
import { useSelector, useDispatch } from "react-redux"

import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"

const useStyles = makeStyles(theme => ({
  objectList: {
    padding: "0 1rem",
    width: "25%",
  },
  objectListItems: {
    border: "none",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0px 3px 10px -5px rgba(0,0,0,0.49)",
    alignItems: "flex-start",
    padding: ".5rem",
  },
}))

/**
 * List objects by submission type. Enables deletion of objects
 */
const WizardSavedObjectsList = ({ submissionType, submissions }: { submissionType: string, submissions: any }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectType = useSelector(state => state.objectType)
  const handleObjectDelete = objectId => {
    dispatch(deleteObjectFromFolder(objectId, objectType))
  }

  return (
    <div className={classes.objectList}>
      <h3>Submitted {submissionType} items</h3>
      <List>
        {submissions.map(submission => {
          return (
            <ListItem key={submission.accessionId} className={classes.objectListItems}>
              <ListItemText primary={submission.accessionId} />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => {
                    handleObjectDelete(submission.accessionId)
                  }}
                  edge="end"
                  aria-label="delete"
                >
                  <ClearIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
    </div>
  )
}

export default WizardSavedObjectsList
