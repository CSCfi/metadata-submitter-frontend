import React, { RefObject, useEffect, useState } from "react"

import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import { styled } from "@mui/system"
import { useForm, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { createSubmission, updateSubmission } from "features/wizardSubmissionSlice"
import { setWorkflowType } from "features/workflowTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import workflowAPIService from "services/workflowAPI"
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

  const [workflows, setWorkflows] = useState([""])

  useEffect(() => {
    let isMounted = true
    const getAllWorkflows = async () => {
      if (isMounted) {
        let cachedWorkflows = sessionStorage.getItem(`cached_workflows`)

        if (!cachedWorkflows) {
          try {
            const response = await workflowAPIService.getAllWorkflows()
            if (response.ok) {
              cachedWorkflows = JSON.stringify(response.data)
              sessionStorage.setItem(`cached_workflows`, cachedWorkflows)
            }
          } catch (error) {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: error,
                helperText: "snackbarMessages.error.helperText.fetchWorkflows",
              })
            )
          }
        }

        const parsedWorkflows = JSON.parse(cachedWorkflows as string)

        setWorkflows(Object.keys(parsedWorkflows))
      }
    }

    getAllWorkflows()
    return () => {
      isMounted = false
    }
  }, [])

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data: SubmissionDataFromForm) => {
    if (selectedWorkflowType === "") {
      return
    }

    if (submission && submission?.submissionId) {
      dispatch(updateSubmission(submission.submissionId, Object.assign({ ...data, submission })))
        .then(() => {
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
      dispatch(setWorkflowType(data.workflowType))
      dispatch(createSubmission(projectId, data))
        .then(response => {
          const submissionId = response.data.submissionId
          navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: "step=2" })
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    }
  }

  const workflowType = useAppSelector(state => state.workflowType)
  const [selectedWorkflowType, setSelectedWorkflowType] = useState(workflowType)

  return (
    <Form
      onSubmit={handleSubmit(async data => onSubmit(data as SubmissionDataFromForm))}
      ref={ref as RefObject<HTMLFormElement>}
    >
      <Typography variant="h4" gutterBottom component="div" color="secondary" fontWeight="700">
        {t("newSubmission.nameSubmission")}
      </Typography>
      <Controller
        control={control}
        name="name"
        defaultValue={submission ? submission.name : ""}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={`${t("newSubmission.submissionName")} *`}
            variant="outlined"
            fullWidth
            error={!!error}
            helperText={error ? t("newSubmission.errors.missingName") : null}
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
            inputProps={{ "data-testid": "submissionDescription" }}
          />
        )}
        rules={{ required: true, validate: { description: value => value.length > 0 } }}
      />
      <Grid sx={{ mt: 2 }} container spacing={2}>
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
      </Grid>
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
