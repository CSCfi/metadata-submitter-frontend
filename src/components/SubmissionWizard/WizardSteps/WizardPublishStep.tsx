import { useEffect } from "react"

import ContentCopy from "@mui/icons-material/ContentCopy"
import { Box, Button, CircularProgress, Link, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

import { ResponseStatus } from "constants/responseStatus"
import { SDObjectTypes } from "constants/wizardObject"
import { SubmissionStatus } from "constants/wizardSubmission"
import { updateStatus } from "features/statusMessageSlice"
import {
  publishSubmissionContent,
  addRegistrationsToSubmission,
} from "features/wizardSubmissionSlice"
import { useAppDispatch, useAppSelector } from "hooks"

const WizardPublishStep = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const mappedSteps = useAppSelector(state => state.wizardMappedSteps)

  useEffect(() => {
    if (submission.published && !submission.registrations) {
      dispatch(addRegistrationsToSubmission(submission.submissionId))
    }
  }, [submission.published])

  const publish = async () => {
    dispatch(publishSubmissionContent(submission)).catch(error =>
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: error,
          helperText: "snackbarMessages.error.helperText.submissionPublish",
        })
      )
    )
  }

  const copyLink = () => {
    if (submission.registrations?.dataciteUrl) {
      navigator.clipboard.writeText(submission.registrations?.dataciteUrl).then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "snackbarMessages.success.publish.copied",
          })
        )
      })
    }
  }

  const submissionStatus = submission.published
    ? SubmissionStatus.published
    : SubmissionStatus.unpublished

  const title = t(`publishPage.${submissionStatus}.title`)
  const text = t(`publishPage.${submissionStatus}.text`)
  const buttonText = t(`publishPage.${submissionStatus}.action`)

  const submissionReady = mappedSteps.every(step => {
    // Rudimentary check that required steps are submitted
    if (step?.schemas) {
      return step.schemas.every(schema => {
        if (schema?.required && schema.objectType !== SDObjectTypes.publishSubmission) {
          // Required objects in step objects
          return !!schema.objects?.length
        }
        return true
      })
    }
    return false
  })

  return (
    <Box sx={{ p: "4rem" }}>
      {submission.published && !submission.registrations?.dataciteUrl ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h4" gutterBottom color="secondary" fontWeight="700">
            {title}
          </Typography>
          <p>
            {text}
            <Link href={submission.registrations?.dataciteUrl} target="_blank">
              {submission.registrations?.dataciteUrl}
            </Link>
          </p>
          <Button
            sx={{ mt: "2rem" }}
            size="large"
            variant="contained"
            aria-label={
              submission.published ? t("ariaLabels.copyLink") : t("ariaLabels.publishSubmission")
            }
            data-testid={submission.published ? "copy-identifier-link" : "publish-submission"}
            onClick={submission.published ? copyLink : publish}
            disabled={submission.published ? false : !submissionReady}
          >
            {submission.published && <ContentCopy sx={{ mr: "0.5rem" }} fontSize="large" />}
            {buttonText}
          </Button>
        </>
      )}
    </Box>
  )
}

export default WizardPublishStep
