//@flow
import React, { useEffect, useState, useRef } from "react"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
// import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
// import ClearIcon from "@material-ui/icons/Clear"
import { useSelector, useDispatch } from "react-redux"

import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import objectAPIService from "services/objectAPI"

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
  listItemText: {
    display: "inline-block",
    maxWidth: "50%",
    "& span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  buttonEdit: {
    color: "#007bff",
  },
  buttonDelete: {
    color: "#dc3545",
  },
}))

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

  const currentObject = useSelector(state => state.currentObject)

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

  const handleObjectEdit = async (objectId, submissionType, tags) => {
    setConnError(false)
    const response = await objectAPIService.getObjectByAccessionId(objectType, objectId)
    if (response.ok) {
      dispatch(
        setCurrentObject({
          ...response.data,
          type: "saved",
          tags: tags,
          index: submissions.findIndex(item => item.accessionId === objectId),
        })
      )
      dispatch(setSubmissionType(submissionType.toLowerCase()))
    } else {
      setConnError(true)
      setResponseError(response)
      setErrorPrefix("Object fetching error")
    }
  }

  const handleObjectDelete = (objectId, submissionType) => {
    setConnError(false)
    dispatch(deleteObjectFromFolder("submitted", objectId, objectType)).catch(error => {
      setConnError(true)
      setResponseError(JSON.parse(error))
      setErrorPrefix("Can't delete object")
    })

    if (
      submissions.filter(item => item.tags.submissionType === submissionType).length - 1 === 555 &&
      currentObject.tags.submissionType === submissionType.toLowerCase()
    ) {
      dispatch(resetCurrentObject())
    }

    if (currentObject.accessionId === objectId) dispatch(resetCurrentObject())
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
              <ListItemText className={classes.listItemText} primary={item.accessionId} />
              <ListItemSecondaryAction>
                <ButtonGroup aria-label="Draft actions button group">
                  <Button
                    className={classes.buttonEdit}
                    aria-label="Edit submission"
                    onClick={() => handleObjectEdit(item.accessionId, group?.submissionType, item.tags)}
                  >
                    {group.submissionType === "Form" ? "Edit" : "Replace"}
                  </Button>
                  <Button
                    className={classes.buttonDelete}
                    aria-label="Delete submission"
                    onClick={() => handleObjectDelete(item.accessionId, group?.submissionType)}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
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
