/* Workflows are disabled for MVP */
import React, { RefObject, useEffect, useState } from "react"

import {
  Button,
  // FormControl,
  // FormControlLabel,
  // FormLabel,
  // FormHelperText,
  // Grid,
  // Radio,
  // RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import { styled } from "@mui/system"
import { useForm, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import checkUnsavedInputHook from "components/SubmissionWizard/WizardHooks/WizardCheckUnsavedInputHook"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { resetUnsavedForm } from "features/unsavedFormSlice"
import { createSubmission, updateSubmission } from "features/wizardSubmissionSlice"
import { setWorkflowType } from "features/workflowTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
// import workflowAPIService from "services/workflowAPI"
import type { SubmissionDataFromForm, HandlerRef } from "types"
import { pathWithLocale } from "utils"

const Form = styled("form")({
  "& .MuiTextField-root": {
    margin: "1rem 0",
  },
  padding: "4rem",
})

/**
 * Define React Hook Form for adding new submission. Ref is added to RHF so submission can be triggered outside this component.
 */
const CreateSubmissionForm = ({ ref }: { ref: HandlerRef }) => {
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(state => state.projectId)
  const submission = useAppSelector(state => state.submission)

  const { t } = useTranslation()

  // Temporary disable workflow selection and use SDSX only
  // const [workflows, setWorkflows] = useState([""])
  const [selectedWorkflowType] = useState("SDSX")

  // useEffect(() => {
  //   let isMounted = true
  //   const getAllWorkflows = async () => {
  //     if (isMounted) {
  //       let cachedWorkflows = sessionStorage.getItem(`cached_workflows`)

  //       if (!cachedWorkflows) {
  //         try {
  //           const response = await workflowAPIService.getAllWorkflows()
  //           if (response.ok) {
  //             cachedWorkflows = JSON.stringify(response.data)
  //             sessionStorage.setItem(`cached_workflows`, cachedWorkflows)
  //           }
  //         } catch (error) {
  //           dispatch(
  //             updateStatus({
  //               status: ResponseStatus.error,
  //               response: error,
  //               helperText: "snackbarMessages.error.helperText.fetchWorkflows",
  //             })
  //           )
  //         }
  //       }

  //       const parsedWorkflows = JSON.parse(cachedWorkflows as string)

  //       setWorkflows(Object.keys(parsedWorkflows))
  //     }
  //   }

  //   getAllWorkflows()
  //   return () => {
  //     isMounted = false
  //   }
  // }, [])

  useEffect(() => {
    if (submission?.name && submission?.description) {
      // set default form values
      reset({
        name: submission.name,
        description: submission.description,
      })
    }
  }, [submission])

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { isSubmitting, dirtyFields, defaultValues },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data: SubmissionDataFromForm) => {
    if (selectedWorkflowType === "") {
      return
    }

    if (submission && submission?.submissionId) {
      dispatch(updateSubmission(submission.submissionId, Object.assign({ ...data, submission })))
        .then(() => {
          reset(data, { keepValues: true }) // reset form state
          dispatch(resetUnsavedForm())
          dispatch(
            updateStatus({
              status: ResponseStatus.success,
              helperText: "snackbarMessages.success.submission.updated",
            })
          )
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    } else {
      // Create a new submission
      // dispatch(setWorkflowType(data.workflowType))
      dispatch(setWorkflowType("SDSX"))
      dispatch(createSubmission(projectId, data))
        .then(response => {
          const submissionId = response.data.submissionId
          // RHF does not reset form state after submit
          reset(data, { keepValues: true })
          dispatch(resetUnsavedForm())
          navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: "step=2" })
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    }
  }

  // Temporary disable workflow selection and use SDSX only
  // const workflowType = useAppSelector(state => state.workflowType)
  // const [selectedWorkflowType, setSelectedWorkflowType] = useState(workflowType)

  return (
    <Form
      onSubmit={handleSubmit(async data => onSubmit(data as SubmissionDataFromForm))}
      ref={ref as RefObject<HTMLFormElement>}
      onBlur={() => checkUnsavedInputHook(dirtyFields, defaultValues, getValues, dispatch)}
    >
      <Typography variant="h4" gutterBottom component="div" color="secondary" fontWeight="700">
        {t("newSubmission.nameSubmission")}
      </Typography>
      <Controller
        control={control}
        name="name"
        defaultValue={""}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={`${t("newSubmission.submissionName")} *`}
            variant="outlined"
            fullWidth
            error={!!error}
            helperText={error ? t("newSubmission.errors.missingName") : null}
            disabled={isSubmitting}
            slotProps={{ htmlInput: { "data-testid": "submissionName" } }}
          />
        )}
        rules={{ required: true, validate: { name: value => value.length > 0 } }}
      />
      <Controller
        control={control}
        name="description"
        defaultValue={""}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={`${t("newSubmission.submissionDescription")} *`}
            variant="outlined"
            fullWidth
            multiline
            rows={5}
            error={!!error}
            helperText={error ? t("newSubmission.errors.missingDescription") : null}
            disabled={isSubmitting}
            slotProps={{ htmlInput: { "data-testid": "submissionDescription" } }}
          />
        )}
        rules={{ required: true, validate: { description: value => value.length > 0 } }}
      />

      {/* Temporary disable workflow selection and use SDSX only */}
      <Controller
        control={control}
        name="workflowType"
        defaultValue={selectedWorkflowType}
        data-testid="SDSX"
        render={() => <input id="hiddenWorkflow" type="hidden" name="workflowType" />}
      />
      {/* <Grid sx={{ mt: 2 }} container spacing={2}>
        <Grid>
          <FormLabel
            id="submission-type-selection-label"
            required
            error={selectedWorkflowType === "" && isSubmitted}
            sx={theme => ({
              background: theme.palette.background.default,
              borderRadius: theme.spacing(0.4),
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: theme.spacing(0, 3, 0, 1.5),
              fontWeight: 600,
              color: theme.palette.secondary.main,
            })}
          >
            {t("newSubmission.typeOfSubmission")}
          </FormLabel>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl>
            <Controller
              control={control}
              name="workflowType"
              defaultValue={selectedWorkflowType}
              render={({ field }) => {
                const handleChangeWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e.target.value)
                  setSelectedWorkflowType(e.target.value)
                }

                return (
                  <RadioGroup
                    {...field}
                    name="submission-type-selection"
                    aria-labelledby="submission-type-selection-label"
                    onChange={handleChangeWorkflow}
                  >
                    {workflows.map(workflow => (
                      <FormControlLabel
                        key={workflow}
                        value={workflow}
                        control={<Radio />}
                        label={workflow}
                        data-testid={workflow}
                        disabled={submission.submissionId !== ""}
                      />
                    ))}
                  </RadioGroup>
                )
              }}
            />
            {selectedWorkflowType === "" && isSubmitted && (
              <FormHelperText error data-testid="missing-workflow-error">
                {t("newSubmission.errors.missingWorkflow")}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid> */}
      <Button
        sx={{ mt: "2rem", p: "1rem 5rem" }}
        size="large"
        variant="contained"
        type="submit"
        aria-label={t("ariaLabels.saveDetails")}
        data-testid="create-submission"
      >
        {t("save")}
      </Button>
    </Form>
  )
}

/*
 * Show form to create submission as first step of new submission wizard
 */

const WizardCreateSubmissionStep = ({ ref }: { ref: HandlerRef }) => (
  <CreateSubmissionForm ref={ref} />
)

export default WizardCreateSubmissionStep
