import React, { useState } from "react"

import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useNavigate } from "react-router-dom"

import WizardAlert from "../WizardComponents/WizardAlert"
import WizardObjectStatusBadge from "../WizardComponents/WizardObjectStatusBadge"
import WizardSavedObjectActions from "../WizardComponents/WizardSavedObjectActions"
import WizardDOIForm from "../WizardForms/WizardDOIForm"
import editObjectHook from "../WizardHooks/WizardEditObjectHook"
import saveDraftsAsTemplates from "../WizardHooks/WizardSaveTemplatesHook"

import { ResponseStatus } from "constants/responseStatus"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { resetFileTypes } from "features/fileTypesSlice"
import { setOpenedDoiForm } from "features/openedDoiFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
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
  const accordion = useAppSelector(state => state.accordion)
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

  // console.log(folder)
  // console.log("accordion: ", accordion.slice(0, accordion.length - 1))

  const handleEdit = (draft, objectType, item, step, objects) => {
    dispatch(updateStep({ step: step, objectType: objectType }))
    const folderId = folder.folderId

    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=1" })
        break
      }
      default: {
        editObjectHook(
          draft,
          objectType,
          item,
          step,
          folderId,
          dispatch,
          navigate,
          objects.findIndex(object => object.id === item.accessionId)
        )
      }
    }
  }

  return (
    <Container sx={theme => ({ paddingTop: theme.spacing(1) })}>
      <Typography variant="h4">Summary</Typography>

      {accordion.slice(0, accordion.length - 1).map((summaryItem, index) => {
        return (
          <Container
            key={summaryItem.label}
            disableGutters
            sx={theme => {
              const itemBorder = `1px solid ${theme.palette.secondary.lightest}`
              return {
                "& .MuiGrid-container": { border: itemBorder, borderBottom: 0 },
                "& ul:last-child .MuiGrid-container:last-child": { borderBottom: itemBorder },
              }
            }}
          >
            <Typography variant="h5" sx={theme => ({ padding: theme.spacing(3, 0) })}>
              {index + 1}. {summaryItem.label}
            </Typography>

            {summaryItem.stepItems?.map(stepItem => {
              const objects = stepItem.objects

              if (objects) {
                const objectsList = Object.values(objects).flat()

                return (
                  <ul key={stepItem.objectType}>
                    {objectsList.map(item => {
                      const draft = item.objectData?.schema.includes("draft-")
                      return (
                        <Grid
                          key={item.id}
                          container
                          spacing={2}
                          sx={theme => ({
                            margin: 0,
                            "& .MuiGrid-item": { padding: theme.spacing(1, 2), alignSelf: "center" },
                          })}
                        >
                          <Grid item xs={3} md>
                            <WizardObjectStatusBadge draft={draft || false} />
                          </Grid>
                          <Grid item xs={7} md={7}>
                            {item.displayTitle}
                          </Grid>
                          <Grid item xs={2} md sx={{ textAlign: "right" }}>
                            <Link
                              href="#"
                              onClick={() =>
                                handleEdit(draft, stepItem.objectType, item.objectData, index + 1, objectsList)
                              }
                            >
                              Edit
                            </Link>
                          </Grid>
                        </Grid>
                      )
                    })}
                  </ul>
                )
              } else {
                return <div>No added items.</div>
              }
            })}
          </Container>
        )
      })}

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
    </Container>
  )
}

export default WizardShowSummaryStep
