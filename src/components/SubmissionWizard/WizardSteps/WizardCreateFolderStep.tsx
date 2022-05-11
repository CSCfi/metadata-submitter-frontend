import React, { RefObject } from "react"

import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import Grid from "@mui/material/Grid"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import MuiTextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import transformTemplatesToDrafts from "components/SubmissionWizard/WizardHooks/WizardTransformTemplatesToDrafts"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { resetTemplateAccessionIds } from "features/templateAccessionIdsSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { createSubmissionFolder, updateSubmissionFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { FolderDataFromForm, CreateFolderFormRef } from "types"
import { pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: "1rem 0",
    },
    padding: "2rem",
  },
  submitButton: {
    marginTop: "2rem",
    padding: "1rem 5rem",
  },
  typeOfSubmissionRow: {
    marginTop: theme.spacing(-1),
  },
  typeOfSubmissionLabel: {
    background: theme.palette.background.default,
    borderRadius: theme.spacing(0.4),
    height: "100%",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 3, 0, 1.5),
    fontWeight: 600,
    color: theme.palette.secondary.main,
  },
}))

/**
 * Define React Hook Form for adding new folder. Ref is added to RHF so submission can be triggered outside this component.
 */
const CreateFolderForm = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(state => state.projectId)
  const folder = useAppSelector(state => state.submissionFolder)
  const templates = useAppSelector(state => state.templates)
  const templateAccessionIds = useAppSelector(state => state.templateAccessionIds)

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data: FolderDataFromForm) => {
    // Transform the format of templates to drafts with proper values to be added to current folder or new folder
    const selectedDraftsArray =
      templates && folder?.folderId
        ? await transformTemplatesToDrafts(templateAccessionIds, templates, folder.folderId, dispatch)
        : []

    if (folder && folder?.folderId) {
      dispatch(updateSubmissionFolder(folder.folderId, Object.assign({ ...data, folder, selectedDraftsArray })))
        .then(() => {
          dispatch(resetTemplateAccessionIds())
          dispatch(updateStatus({ status: ResponseStatus.success, helperText: "Folder updated" }))
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    } else {
      // Create a new folder with selected templates as drafts

      dispatch(createSubmissionFolder(projectId, data, selectedDraftsArray))
        .then(response => {
          const folderId = response.data.folderId
          navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=2" })
          dispatch(setObjectType(ObjectTypes.study))
          dispatch(setSubmissionType(ObjectSubmissionTypes.form))
          dispatch(updateStep({ step: 2, objectType: ObjectTypes.study }))
          dispatch(resetTemplateAccessionIds())
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    }
  }

  return (
    <React.Fragment>
      <form
        className={classes.root}
        onSubmit={handleSubmit(async data => onSubmit(data as FolderDataFromForm))}
        ref={createFolderFormRef as RefObject<HTMLFormElement>}
      >
        <Typography variant="h4" gutterBottom component="div" color="secondary">
          Name your submission
        </Typography>
        <Controller
          control={control}
          name="name"
          defaultValue={folder ? folder.name : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Folder Name *"
              variant="outlined"
              fullWidth
              error={!!error}
              helperText={error ? "Please give a name for folder." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "folderName" }}
            />
          )}
          rules={{ required: true, validate: { name: value => value.length > 0 } }}
        />
        <Controller
          control={control}
          name="description"
          defaultValue={folder ? folder.description : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Folder Description *"
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              error={!!error}
              helperText={error ? "Please give a description for folder." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "folderDescription" }}
            />
          )}
          rules={{ required: true, validate: { description: value => value.length > 0 } }}
        />

        <Grid container spacing={2} className={classes.typeOfSubmissionRow}>
          <Grid item>
            <div className={classes.typeOfSubmissionLabel} id="submission-type-selection-label">
              Type of submission
            </div>
          </Grid>
          <Grid item xs={6}>
            <FormControl>
              <RadioGroup name="submission-type-selection" aria-labelledby="submission-type-selection-label">
                <FormControlLabel value="FEGA" control={<Radio checked={true} />} label="FEGA" />
                <FormControlLabel value="BigPicture" control={<Radio disabled />} label="BigPicture (placeholder)" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          size="large"
          variant="contained"
          type="submit"
          className={classes.submitButton}
          aria-label="Save submission details"
        >
          Save
        </Button>
      </form>
    </React.Fragment>
  )
}

/**
 * Show form to create folder as first step of new draft wizard
 */

const WizardCreateFolderStep = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => (
  <>
    <CreateFolderForm createFolderFormRef={createFolderFormRef} />
  </>
)

export default WizardCreateFolderStep
