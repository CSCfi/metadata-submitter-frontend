//@flow
import React, { useState, useEffect } from "react"
import type { Node } from "react"

import Box from "@material-ui/core/Box"
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

import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetFocus } from "features/focusSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText } from "utils"

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    padding: 0,
  },
  cardHeader: theme.wizard.cardHeader,
  objectList: {
    padding: theme.spacing(0, 2),
  },
  objectListItem: theme.wizard.objectListItem,
  buttonContinue: {
    color: theme.palette.button.edit,
  },
  buttonDelete: {
    color: theme.palette.button.delete,
  },
}))

/**
 * List drafts by submission type. Enables fetch and deletion of drafts
 */
const WizardDraftObjectPicker = (): Node => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectType = useSelector(state => state.objectType)
  const folder = useSelector(state => state.submissionFolder)
  const currentObjectTypeDrafts: Array<ObjectInsideFolderWithTags> = folder.drafts.filter(
    draft => draft.schema === "draft-" + objectType
  )

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
      dispatch(setCurrentObject({ ...response.data, status: ObjectStatus.draft }))
      dispatch(setSubmissionType(ObjectSubmissionTypes.form))
    } else {
      setConnError(true)
      setResponseError(response)
      setErrorPrefix("Draft fetching error.")
    }
  }

  const handleObjectDelete = objectId => {
    setConnError(false)
    dispatch(deleteObjectFromFolder(ObjectStatus.draft, objectId, objectType)).catch(error => {
      setConnError(true)
      setResponseError(JSON.parse(error))
      setErrorPrefix("Can't delete draft")
    })
  }

  const setRef = ref => {
    draftRefs.push(ref)
  }

  return (
    <Container maxWidth={false} className={classes.container}>
      <CardHeader
        title="Choose from drafts"
        titleTypographyProps={{ variant: "inherit" }}
        className={classes.cardHeader}
      />
      {currentObjectTypeDrafts.length > 0 ? (
        <List className={classes.objectList} aria-label={objectType}>
          {currentObjectTypeDrafts.map(submission => {
            return (
              <ListItem key={submission.accessionId} className={classes.objectListItem}>
                <ListItemText primary={getItemPrimaryText(submission)} secondary={submission.accessionId} />
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
        <Box pt={5}>
          <Typography component="h2" variant="subtitle1" align="center">
            No {objectType} drafts.
          </Typography>
        </Box>
      )}

      {connError && (
        <WizardStatusMessageHandler
          successStatus={WizardStatus.error}
          response={responseError}
          prefixText={errorPrefix}
        />
      )}
    </Container>
  )
}

export default WizardDraftObjectPicker
