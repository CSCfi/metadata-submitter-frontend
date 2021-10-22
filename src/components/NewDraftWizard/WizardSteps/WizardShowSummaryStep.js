//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useSelector, useDispatch } from "react-redux"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSavedObjectActions from "../WizardComponents/WizardSavedObjectActions"
import WizardStepper from "../WizardComponents/WizardStepper"
import WizardDOIForm from "../WizardForms/WizardDOIForm"

import { resetAutocompleteField } from "features/autocompleteSlice"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText, formatDisplayObjectType } from "utils"

const useStyles = makeStyles(theme => ({
  summary: {
    padding: theme.spacing(1),
    width: theme.spacing(100),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  schemaTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    paddingTop: theme.spacing(1),
    "& .objectAmount": {
      marginRight: theme.spacing(1),
      fontWeight: "bold",
    },
  },
  listGroup: {
    padding: "0",
  },
  objectListItems: {
    borderBottom: `solid 1px ${theme.palette.secondary.main}`,
    alignItems: "flex-start",
    padding: theme.spacing(1.5),
  },
  doiButton: {
    marginTop: theme.spacing(4),
  },
}))

type Schema = "study" | "schema" | "experiment" | "run" | "analysis" | "dac" | "policy" | "dataset"

type GroupedBySchema = {| [Schema]: Array<ObjectInsideFolderWithTags> |}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = (): React$Element<any> => {
  const folder = useSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  const objectsArray = useSelector(state => state.objectTypesArray)
  const groupedObjects: Array<GroupedBySchema> = objectsArray.map((schema: string) => {
    return {
      [(schema: string)]: metadataObjects.filter(object => object.schema.toLowerCase() === schema.toLowerCase()),
    }
  })

  const [openDoiDialog, setOpenDoiDialog] = useState(false)

  const classes = useStyles()
  const dispatch = useDispatch()

  const DOIDialog = () => (
    <Dialog
      maxWidth="md"
      fullWidth
      open={openDoiDialog}
      onClose={() => setOpenDoiDialog(false)}
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
        <Button
          variant="contained"
          onClick={() => {
            setOpenDoiDialog(false)
            dispatch(resetAutocompleteField())
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpenDoiDialog(false)
          }}
          color="primary"
          type="submit"
          form="doi-form"
        >
          Save DOI info
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <>
      <WizardHeader headerText="Create Submission" />
      <WizardStepper />
      <WizardHeader headerText="Summary" />
      <div className={classes.summary}>
        {groupedObjects.map(group => {
          const schema = Object.keys(group)[0]
          return (
            <List key={schema} aria-label={schema} className={classes.listGroup}>
              <div className={classes.schemaTitleRow}>
                <Typography variant="subtitle1" fontWeight="fontWeightBold">
                  {formatDisplayObjectType(schema)}
                </Typography>
                <div className="objectAmount">{group[schema].length}</div>
              </div>
              <div>
                {group[schema].map(item => (
                  <ListItem button key={item.accessionId} dense className={classes.objectListItems}>
                    <ListItemText
                      primary={getItemPrimaryText(item)}
                      secondary={item.accessionId}
                      data-schema={item.schema}
                    />
                    <ListItemSecondaryAction>
                      <WizardSavedObjectActions
                        folderId={folder.folderId}
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
      <Button
        variant="contained"
        color="secondary"
        className={classes.doiButton}
        onClick={() => setOpenDoiDialog(true)}
      >
        Add DOI information (optional)
      </Button>
      {openDoiDialog && <DOIDialog />}
    </>
  )
}

export default WizardShowSummaryStep
