import React, { useState } from "react"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useNavigate } from "react-router-dom"

import WizardAlert from "../WizardComponents/WizardAlert"
import WizardSavedObjectActions from "../WizardComponents/WizardSavedObjectActions"
import WizardDOIForm from "../WizardForms/WizardDOIForm"
import saveDraftsAsTemplates from "../WizardHooks/WizardSaveTemplatesHook"

import { ResponseStatus } from "constants/responseStatus"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { resetFileTypes } from "features/fileTypesSlice"
import { setOpenedDoiForm } from "features/openedDoiFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { publishFolderContent, resetFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { ObjectInsideFolderWithTags, ObjectInsideFolderWithTagsBySchema, Schema } from "types"
import { getItemPrimaryText, formatDisplayObjectType, pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  summary: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  schemaTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    paddingTop: 1,
    "& .objectAmount": {
      marginRight: 1,
      fontWeight: "bold",
    },
  },
  listGroup: {
    padding: "0",
  },
  objectListItems: {
    borderBottom: `solid 1px ${theme.palette.secondary.main}`,
    alignItems: "flex-start",
    padding: 2,
  },
  buttonContainer: {
    marginTop: theme.spacing(1),
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
  },
}))

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep: React.FC = () => {
  const folder = useAppSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  const objectsArray = useAppSelector(state => state.objectTypesArray)
  const openedDoiForm = useAppSelector(state => state.openedDoiForm)
  const projectId = useAppSelector(state => state.projectId)
  const groupedObjects: ObjectInsideFolderWithTagsBySchema[] = objectsArray.map((schema: Schema) => {
    return {
      [schema]: metadataObjects.filter(
        (object: { schema: string }) => object.schema.toLowerCase() === schema.toLowerCase()
      ),
    }
  })

  const classes = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const DOIDialog = () => (
    <Dialog
      maxWidth="md"
      fullWidth
      open={openedDoiForm}
      onClose={() => dispatch(setOpenedDoiForm(false))}
      aria-labelledby="doi-dialog-title"
      aria-describedby="doi-dialog-description"
    >
      <DialogTitle id="doi-dialog-title">DOI information</DialogTitle>
      <DialogContent>
        <DialogContentText id="doi-dialog-description" data-testid="doi-dialog-content">
          Please fill in and save the information if you would like your submission to have DOI.
        </DialogContentText>
        <WizardDOIForm formId="doi-form" />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCancelDoiDialog} color="secondary">
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit" form="doi-form">
          Save DOI info
        </Button>
      </DialogActions>
    </Dialog>
  )

  const handleCancelDoiDialog = () => {
    dispatch(setOpenedDoiForm(false))
    dispatch(resetAutocompleteField())
    dispatch(resetCurrentObject())
  }

  const handleOpenDoiDialog = () => {
    dispatch(setOpenedDoiForm(true))
    dispatch(setCurrentObject(folder.doiInfo))
  }

  const handlePublishDialog = async (alertWizard: boolean, formData?: Array<ObjectInsideFolderWithTags>) => {
    const resetDispatch = () => {
      navigate(pathWithLocale("home"))
      dispatch(resetObjectType())
      dispatch(resetFolder())
    }

    if (alertWizard) {
      if (formData && formData?.length > 0) {
        await saveDraftsAsTemplates(projectId, formData, dispatch)
      }
      // Publish the folder
      dispatch(publishFolderContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: `Couldn't publish folder with id ${folder.folderId}`,
            })
          )
        })
      dispatch(resetFileTypes())
    } else {
      setDialogOpen(false)
    }
    setDialogOpen(false)
  }

  return (
    <>
      <div className={classes.summary}>
        {groupedObjects.map((group: ObjectInsideFolderWithTagsBySchema) => {
          const schema = Object.keys(group)[0]
          return (
            <List key={schema} aria-label={schema} className={classes.listGroup}>
              <div className={classes.schemaTitleRow}>
                <Typography variant="subtitle1">{formatDisplayObjectType(schema)}</Typography>
                <div className="objectAmount">{group[schema].length}</div>
              </div>
              <div>
                {group[schema].map((item: ObjectInsideFolderWithTags) => (
                  <ListItem button key={item.accessionId} dense className={classes.objectListItems}>
                    <ListItemText
                      primary={getItemPrimaryText(item)}
                      secondary={item.accessionId}
                      data-schema={item.schema}
                    />
                    <ListItemSecondaryAction>
                      <WizardSavedObjectActions
                        submissions={metadataObjects}
                        objectType={schema}
                        objectId={item.accessionId}
                        submissionType={item.tags?.submissionType ? item.tags.submissionType : ""}
                        tags={item.tags}
                        summary={true}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </div>
            </List>
          )
        })}
      </div>
      <div className={classes.buttonContainer}>
        <Button variant="contained" color="secondary" onClick={handleOpenDoiDialog}>
          Add DOI information (optional)
        </Button>

        <Button variant="contained" onClick={() => setDialogOpen(true)} data-testid="summary-publish">
          Publish
        </Button>
      </div>

      {openedDoiForm && <DOIDialog />}

      {dialogOpen && (
        <WizardAlert onAlert={handlePublishDialog} parentLocation="footer" alertType={"publish"}></WizardAlert>
      )}
    </>
  )
}

export default WizardShowSummaryStep
