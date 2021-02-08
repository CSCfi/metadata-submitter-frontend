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

import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

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
    const toggle = setTimeout(() => {
      setVisible(false)
    }, delay)
    return () => clearTimeout(toggle)
  }, [delay])

  return <span className={visible ? classes.addedMessage : classes.hidden}>{children}</span>
}

/**
 * List objects by submission type. Enables deletion of objects
 */
const WizardSavedObjectsList = ({ submissions }: { submissions: any }) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = submissions
  })

  const classes = useStyles()

  const dispatch = useDispatch()
  const objectType = useSelector(state => state.objectType)
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")
  const newObject = submissions.filter(x => !ref.current?.includes(x))
  // filter submissionTypes that exist in current submissions & sort them according to alphabetical order
  const submissionTypes = submissions
    .map(obj => obj.tags.submissionType)
    .filter((val, ind, arr) => arr.indexOf(val) === ind)
    .sort()

  // group submissions according to their submissionType
  const groupedSubmissions = submissionTypes.map(submissionType => ({
    submissionType,
    submittedItems: submissions.filter(obj => obj.tags.submissionType === submissionType),
  }))

  const handleObjectDelete = objectId => {
    setConnError(false)
    dispatch(deleteObjectFromFolder("submitted", objectId, objectType)).catch(error => {
      setConnError(true)
      setResponseError(JSON.parse(error))
      setErrorPrefix("Can't delete object")
    })
  }

  const displayObjectType = (objectType: string) => {
    return `${objectType.charAt(0).toUpperCase()}${objectType.slice(1)}`
  }

  const displaySubmissionType = (submission: { submissionType: string, submittedItems: any }) => {
    switch (submission.submissionType) {
      case "Form":
        return submission.submittedItems.length >= 2 ? "Forms" : "Form"
      case "XML":
        return submission.submittedItems.length >= 2 ? "XML files" : "XML file"
      default:
        break
    }
  }

  return (
    <div className={classes.objectList}>
      {groupedSubmissions.map(group => (
        <List key={group.submissionType} aria-label={group.submissionType}>
          <h3 className={classes.header}>
            Submitted {displayObjectType(objectType)} {displaySubmissionType(group)}
          </h3>
          {group.submittedItems.map(item => (
            <ListItem key={item.accessionId} className={classes.objectListItems}>
              <ListItemText primary={item.accessionId} />
              <ListItemSecondaryAction>
                {newObject.length === 1 && newObject[0]?.accessionId === item.accessionId && (
                  <ToggleMessage delay={5000}>Added!</ToggleMessage>
                )}
                <IconButton
                  onClick={() => {
                    handleObjectDelete(item.accessionId)
                  }}
                  edge="end"
                  aria-label="delete"
                >
                  <ClearIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ))}
      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </div>
  )
}

export default WizardSavedObjectsList
