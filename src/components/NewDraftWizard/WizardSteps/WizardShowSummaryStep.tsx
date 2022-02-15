import React from "react"

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

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSavedObjectActions from "../WizardComponents/WizardSavedObjectActions"
import WizardStepper from "../WizardComponents/WizardStepper"
import WizardDOIForm from "../WizardForms/WizardDOIForm"

import { resetAutocompleteField } from "features/autocompleteSlice"
import { setOpenedDoiForm } from "features/openedDoiFormSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { ObjectInsideFolderWithTags, ObjectInsideFolderWithTagsBySchema, Schema } from "types"
import { getItemPrimaryText, formatDisplayObjectType } from "utils"

const useStyles = makeStyles(theme => ({
  summary: {
    padding: 1,
    width: 100,
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
  doiButton: {
    marginTop: 4,
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
  const groupedObjects: ObjectInsideFolderWithTagsBySchema[] = objectsArray.map((schema: Schema) => {
    return {
      [schema]: metadataObjects.filter(
        (object: { schema: string }) => object.schema.toLowerCase() === schema.toLowerCase()
      ),
    }
  })

  const classes = useStyles()
  const dispatch = useAppDispatch()

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

  return (
    <>
      <WizardHeader headerText="Create Submission" />
      <WizardStepper />
      <WizardHeader headerText="Summary" />
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
      <Button variant="contained" color="secondary" className={classes.doiButton} onClick={handleOpenDoiDialog}>
        Add DOI information (optional)
      </Button>
      {openedDoiForm && <DOIDialog />}
    </>
  )
}

export default WizardShowSummaryStep
