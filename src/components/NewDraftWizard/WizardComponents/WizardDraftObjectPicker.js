//@flow
import React, { useState, useEffect } from "react"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import CardHeader from "@material-ui/core/CardHeader"
import Container from "@material-ui/core/Container"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useSelector, useDispatch } from "react-redux"

import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import { resetFocus } from "features/focusSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    padding: 0,
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
  },
  objectList: {
    padding: "0 1rem",
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

  const shouldFocus = useSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && draftRefs[0]) draftRefs[0].focus()
  }, [shouldFocus])

  const draftRefs = []

  const handleObjectContinue = async objectId => {
    if (shouldFocus) dispatch(resetFocus())
    setConnError(false)
    const response = await draftAPIService.getObjectByAccessionId(objectType, objectId)
    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, type: "draft" }))
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

  const setRef = ref => {
    draftRefs.push(ref)
  }

  return (
    <Container className={classes.container}>
      <CardHeader
        title="Choose from drafts"
        titleTypographyProps={{ variant: "inherit" }}
        className={classes.cardHeader}
      />
      {currentObjectTypeDrafts.length > 0 ? (
        <List className={classes.objectList}>
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
                      onBlur={() => dispatch(resetFocus())}
                      ref={setRef}
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
        <Typography variant="subtitle1" align="center">
          No {objectType} drafts.
        </Typography>
      )}

      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </Container>
  )
}

export default WizardDraftObjectPicker
