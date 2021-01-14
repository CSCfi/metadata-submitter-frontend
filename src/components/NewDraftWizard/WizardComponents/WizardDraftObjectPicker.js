//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector, useDispatch } from "react-redux"

import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import { setDraftObject } from "features/wizardDraftObjectSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"

const useStyles = makeStyles(theme => ({
  objectList: {
    padding: "0 1rem",
    width: "100%",
  },
  objectListItems: {
    border: "none",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0px 3px 10px -5px rgba(0,0,0,0.49)",
    alignItems: "flex-start",
    padding: ".5rem",
  },
  buttonContinue: {
    color: "#007bff",
  },
  buttonDelete: {
    color: "#dc3545",
  },
}))

/**
 * List drafts by submission type. Enables fetch and deletion of drafts
 */
const WizardDraftObjectPicker = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectType = useSelector(state => state.objectType)
  const folder = useSelector(state => state.submissionFolder)
  const currentObjectTypeDrafts = folder.drafts.filter(draft => draft.schema === "draft-" + objectType)

  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  const handleObjectContinue = async objectId => {
    setConnError(false)
    const response = await draftAPIService.getObjectByAccessionId(objectType, objectId)
    if (response.ok) {
      dispatch(setDraftObject(response.data))
      dispatch(setSubmissionType("form"))
    } else {
      setConnError(true)
      setResponseError(response)
      setErrorPrefix("Draft fetching error.")
    }
  }

  const handleObjectDelete = objectId => {
    setConnError(false)
    dispatch(deleteObjectFromFolder("draft", objectId, objectType)).catch(error => {
      setConnError(true)
      setResponseError(JSON.parse(error))
      setErrorPrefix("Can't delete draft")
    })
  }

  return (
    <div className={classes.objectList}>
      {currentObjectTypeDrafts.length > 0 ? (
        <List>
          {currentObjectTypeDrafts.map(submission => {
            return (
              <ListItem key={submission.accessionId} className={classes.objectListItems}>
                <ListItemText primary={submission.accessionId} />
                <ListItemSecondaryAction>
                  <ButtonGroup aria-label="Draft actions button group">
                    <Button
                      className={classes.buttonContinue}
                      aria-label="Continue draft"
                      onClick={() => handleObjectContinue(submission.accessionId)}
                    >
                      Continue
                    </Button>
                    <Button
                      className={classes.buttonDelete}
                      aria-label="Delete draft"
                      onClick={() => handleObjectDelete(submission.accessionId)}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
        </List>
      ) : (
        <h3>No {objectType} drafts.</h3>
      )}

      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </div>
  )
}

export default WizardDraftObjectPicker
