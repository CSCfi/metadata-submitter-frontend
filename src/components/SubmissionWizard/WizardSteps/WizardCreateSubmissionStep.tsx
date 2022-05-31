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
import { createSubmission, updateSubmission } from "features/wizardSubmissionSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { SubmissionDataFromForm, FormRef } from "types"
import { pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: "1rem 0",
    },
    padding: "4rem",
  },
  submitButton: {
    marginTop: "2rem",
    padding: "1rem 5rem",
  },
  typeOfSubmissionRow: {
    marginTop: theme.spacing(2),
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
 * Define React Hook Form for adding new submission. Ref is added to RHF so submission can be triggered outside this component.
 */
const CreateSubmissionForm = ({ createSubmissionFormRef }: { createSubmissionFormRef: FormRef }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(state => state.projectId)
  const submission = useAppSelector(state => state.submission)
  const templates = useAppSelector(state => state.templates)
  const templateAccessionIds = useAppSelector(state => state.templateAccessionIds)

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data: SubmissionDataFromForm) => {
    // Transform the format of templates to drafts with proper values to be added to current submission or new submission
    const selectedDraftsArray =
      templates && submission?.submissionId
        ? await transformTemplatesToDrafts(templateAccessionIds, templates, submission.submissionId, dispatch)
        : []

    if (submission && submission?.submissionId) {
      dispatch(updateSubmission(submission.submissionId, Object.assign({ ...data, submission, selectedDraftsArray })))
        .then(() => {
          dispatch(resetTemplateAccessionIds())
          dispatch(updateStatus({ status: ResponseStatus.success, helperText: "Submission updated" }))
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    } else {
      // Create a new submission with selected templates as drafts

      dispatch(createSubmission(projectId, data, selectedDraftsArray))
        .then(response => {
          const submissionId = response.data.submissionId
          navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: "step=2" })
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
        onSubmit={handleSubmit(async data => onSubmit(data as SubmissionDataFromForm))}
        ref={createSubmissionFormRef as RefObject<HTMLFormElement>}
      >
        <Typography variant="h4" gutterBottom component="div" color="secondary" fontWeight="700">
          Name your submission
        </Typography>
        <Controller
          control={control}
          name="name"
          defaultValue={submission ? submission.name : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Submission Name *"
              variant="outlined"
              fullWidth
              error={!!error}
              helperText={error ? "Please give a name for submission." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "submissionName" }}
            />
          )}
          rules={{ required: true, validate: { name: value => value.length > 0 } }}
        />
        <Controller
          control={control}
          name="description"
          defaultValue={submission ? submission.description : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Submission Description *"
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              error={!!error}
              helperText={error ? "Please give a description for submission." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "submissionDescription" }}
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
 * Show form to create submission as first step of new draft wizard
 */

const WizardCreateSubmissionStep = ({ createSubmissionFormRef }: { createSubmissionFormRef: FormRef }) => (
  <>
    <CreateSubmissionForm createSubmissionFormRef={createSubmissionFormRef} />
  </>
)

export default WizardCreateSubmissionStep
