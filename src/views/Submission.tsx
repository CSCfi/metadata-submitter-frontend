import React, { useRef, useEffect, useState, RefObject } from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { useNavigate, useParams } from "react-router"

import WizardStepper from "components/SubmissionWizard/WizardComponents/WizardStepper"
import WizardAddObjectStep from "components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateSubmissionStep from "components/SubmissionWizard/WizardSteps/WizardCreateSubmissionStep"
import WizardDataFolderStep from "components/SubmissionWizard/WizardSteps/WizardDataFolderStep"
import WizardShowSummaryStep from "components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectTypes, ValidSteps } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { setSubmission, resetSubmission } from "features/wizardSubmissionSlice"
import { setWorkflowType } from "features/workflowTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import submissionAPIService from "services/submissionAPI"
import type { HandlerRef } from "types"
import { useQuery } from "utils"
import Page404 from "views/ErrorPages/Page404"

/**
 * Return correct content for each step
 */
const getStepContent = (
  wizardStep: number,
  createSubmissionFormRef: HandlerRef,
  objectFormRef: HandlerRef,
  objectType: string
) => {
  switch (wizardStep) {
    case 1:
      return <WizardCreateSubmissionStep ref={createSubmissionFormRef} />
    case 2:
      return <WizardAddObjectStep formRef={objectFormRef} />
    case 3:
      return <WizardDataFolderStep />
    case 4:
      return <WizardAddObjectStep formRef={objectFormRef} />
    case 5:
      // Datacite, Summary and Publish steps
      switch (objectType.toLowerCase()) {
        case ObjectTypes.datacite:
          return <WizardAddObjectStep formRef={objectFormRef} />
        case ObjectTypes.summary:
          return <WizardShowSummaryStep />
        case ObjectTypes.publish:
          return (
            <div>
              <h1>FIXME publish page here</h1>
            </div>
          )
      }
      break
    default:
      // An empty page
      break
  }
}

/**
 * Container for wizard, renders content for each wizard step.
 *
 * Some children components need to hook extra functionalities to "next step"-button, so reference hook it set here.
 */
const SubmissionWizard: React.FC = () => {
  const dispatch = useAppDispatch()
  const objectType = useAppSelector(state => state.objectType)
  const navigate = useNavigate()
  const params = useParams()
  const queryParams = useQuery()

  const [isFetchingSubmission, setFetchingSubmission] = useState<boolean>(true)
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
          dispatch(setWorkflowType(response.data.workflow))
          setFetchingSubmission(false)
        } else {
          navigate({ pathname: "" })
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: response,
              helperText: "snackbarMessages.error.helperText.fetchSubmission",
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

  const createSubmissionFormRef = useRef<HandlerRef>(null)

  const objectFormRef = useRef<HandlerRef>(undefined)

  return ValidSteps.includes(wizardStep) ? (
    <Container sx={{ flex: "1 0 auto", p: 0 }} maxWidth={false} disableGutters>
      <Grid
        sx={{
          mt: 0,
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
          "&.MuiGrid-item": { pt: 0 },
        }}
        container
      >
        <Grid sx={{ pt: 0, bgcolor: "primary.main" }} size={{ xs: 3 }}>
          <WizardStepper ref={objectFormRef as RefObject<HTMLDivElement | null>} />
        </Grid>
        <Grid sx={{ pl: 5, pr: 5 }} size={{ xs: 9 }}>
          {isFetchingSubmission && submissionId && <LinearProgress />}
          {(!isFetchingSubmission || !submissionId) && (
            <Paper sx={{ p: 0, height: "100%" }} elevation={2}>
              {getStepContent(
                wizardStep,
                createSubmissionFormRef as RefObject<HTMLFormElement | null>,
                objectFormRef as RefObject<HTMLDivElement | null>,
                objectType
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  ) : (
    <Page404 />
  )
}

export default SubmissionWizard
