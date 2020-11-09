//@flow
import React, { useEffect, useState, useRef } from "react"

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
  header: {
    marginBlockEnd: "0",
  },
  objectListItems: {
    border: "none",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0px 3px 10px -5px rgba(0,0,0,0.49)",
    alignItems: "flex-start",
    padding: ".5rem",
  },
  addedMessage: {
    color: theme.palette.success.main,
    visibility: "visible",
    opacity: "1",
    transition: "opacity 2s linear",
  },
  hidden: {
    color: theme.palette.success.main,
    visibility: "hidden",
    opacity: "0",
    transition: "visibility 0s .2s, opacity .2s linear",
  },
}))

const ToggleMessage = ({ delay, children }: { delay: number, children: any }) => {
  const classes = useStyles()
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setVisible(false)
    }, delay)
  }, [delay])

  return <span className={visible ? classes.addedMessage : classes.hidden}>{children}</span>
}

/**
 * List objects by submission type. Enables deletion of objects
 */
const WizardSavedObjectsList = ({ submissionType, submissions }: { submissionType: string, submissions: any }) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = submissions
  })
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectType = useSelector(state => state.objectType)
  const handleObjectDelete = objectId => {
    dispatch(deleteObjectFromFolder(objectId, objectType))
  }
  const newObject = submissions.filter(x => !ref.current?.includes(x))
  return (
    <div className={classes.objectList}>
      <h3 className={classes.header}>Submitted {submissionType} items</h3>
      <List>
        {submissions.map(submission => {
          return (
            <ListItem key={submission.accessionId} className={classes.objectListItems}>
              <ListItemText primary={submission.accessionId} />
              <ListItemSecondaryAction>
                {newObject.length === 1 && newObject[0]?.accessionId === submission.accessionId && (
                  <ToggleMessage delay={5000}>Added!</ToggleMessage>
                )}
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
