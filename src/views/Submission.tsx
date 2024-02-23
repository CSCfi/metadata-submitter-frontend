import React, { useRef, useEffect, useState } from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { useNavigate, useParams } from "react-router-dom"

import WizardFooter from "components/SubmissionWizard/WizardComponents/WizardFooter"
import WizardStepper from "components/SubmissionWizard/WizardComponents/WizardStepper"
import WizardAddObjectStep from "components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateSubmissionStep from "components/SubmissionWizard/WizardSteps/WizardCreateSubmissionStep"
import WizardShowSummaryStep from "components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { setSubmission, resetSubmission } from "features/wizardSubmissionSlice"
import { useAppDispatch } from "hooks"
import submissionAPIService from "services/submissionAPI"
import type { FormRef } from "types"
import { useQuery, pathWithLocale } from "utils"
import Page404 from "views/ErrorPages/Page404"

/**
 * Return correct content for each step
 */
const getStepContent = (wizardStep: number, createSubmissionFormRef: FormRef, objectFormRef: FormRef) => {
  switch (wizardStep) {
    case 1:
      return <WizardCreateSubmissionStep createSubmissionFormRef={createSubmissionFormRef} />
    case 2:
    case 3:
    case 4:
      return <WizardAddObjectStep formRef={objectFormRef} />
    case 5:
      return <WizardShowSummaryStep />
    default:
      return <Page404 />
  }
}

/**
 * Container for wizard, renders content for each wizard step.
 *
 * Some children components need to hook extra functionalities to "next step"-button, so reference hook it set here.
 */
const SubmissionWizard: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const queryParams = useQuery()
  const [isFetchingSubmission, setFetchingSubmission] = useState(true)

  const step = queryParams.get("step")

  const submissionId = params.submissionId || ""

  // Get submission if URL parameters have submissionId. Redirect to home if invalid submissionId
  useEffect(() => {
    let isMounted = true
    const getSubmission = async () => {
      const response = await submissionAPIService.getSubmissionById(submissionId)
      if (isMounted) {
        if (response.ok) {
          dispatch(setSubmission(response.data))

          setFetchingSubmission(false)
        } else {
          navigate({ pathname: pathWithLocale("submission"), search: "step=1" })
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: response,
              helperText: "Fetching submission error.",
            })
          )
          dispatch(resetSubmission())
        }
      }
    }
    if (submissionId) getSubmission()
    return () => {
      isMounted = false
    }
  }, [dispatch, submissionId, navigate])

  const wizardStep = step ? Number(step) : -1

  const createSubmissionFormRef = useRef<null | (HTMLFormElement & { changeCallback: () => void })>(null)

  const objectFormRef = useRef<null | (HTMLFormElement & { changeCallback: () => void })>(null)

  return (
    <Container sx={{ flex: "1 0 auto", p: 0 }} maxWidth={false} disableGutters>
      <Grid
        sx={{
          mt: 7.7,
          minHeight: "calc(100vh - 137px)",
          bgcolor: "background.default",
          "&.MuiGrid-item": { pt: 0 },
        }}
        container
      >
        <Grid item sx={{ pt: 0, bgcolor: "primary.main" }} xs={3}>
          <WizardStepper formRef={objectFormRef} />
        </Grid>
        <Grid item sx={{ pl: 5, pr: 5 }} xs={9}>
          {isFetchingSubmission && submissionId && <LinearProgress />}
          {(!isFetchingSubmission || !submissionId) && (
            <Paper sx={{ p: 0, height: "100%" }} elevation={2}>
              {getStepContent(wizardStep, createSubmissionFormRef, objectFormRef)}
            </Paper>
          )}
        </Grid>
      </Grid>

      <WizardFooter />
    </Container>
  )
}

export default SubmissionWizard
