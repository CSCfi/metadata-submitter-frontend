import React, { useRef, useEffect, useState, RefObject } from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router"

import WizardStepper from "components/SubmissionWizard/WizardComponents/WizardStepper"
import WizardMapObjectsToStepHook from "components/SubmissionWizard/WizardHooks/WizardMapObjectsToStepsHook"
import { ResponseStatus } from "constants/responseStatus"
import { SDObjectTypes } from "constants/wizardObject"
import { WizardStepContent } from "constants/wizardStepContent"
import { WorkflowTypes } from "constants/wizardWorkflow"
import { setObjectTypesArray } from "features/objectTypesArraySlice"
import { setRemsInfo } from "features/remsInfoSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setObjects, resetObjects } from "features/stepObjectSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setWizardMappedSteps } from "features/wizardMappedStepsSlice"
import { setSubmission, resetSubmission } from "features/wizardSubmissionSlice"
import { setWorkflowType } from "features/workflowTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import remsAPIService from "services/remsAPI"
import submissionAPIService from "services/submissionAPI"
import type { HandlerRef, MappedSteps, Workflow } from "types"
import { useQuery } from "utils"
import { loadJSONSchema, loadJSONData, validateJSONData } from "utils/JSONSchemaUtils"
import Page404 from "views/ErrorPages/Page404"

/**
 * Return correct content for each step
 */
const getStepContent = (mappedSteps: MappedSteps[], wizardStep: number, objectType: string) => {
  const stepSchema =
    mappedSteps.length && objectType && Number.isInteger(wizardStep)
      ? mappedSteps[wizardStep - 1].schemas.find(schema => schema.objectType === objectType)
      : null
  if (!stepSchema) return null
  // Render corrent component based on the defined 'componentKey'
  const StepComponent = WizardStepContent[stepSchema.componentKey]
  return StepComponent ? <StepComponent /> : <h1>Page not found</h1>
}

/**
 * Container for wizard, renders wizard step and content for each wizard step.
 */
const SubmissionWizard: React.FC = () => {
  const dispatch = useAppDispatch()
  const objects = useAppSelector(state => state.stepObjects)
  const objectType = useAppSelector(state => state.objectType)
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const submission = useAppSelector(state => state.submission)
  const workflowType = useAppSelector(state => state.workflowType)
  const mappedSteps = useAppSelector(state => state.wizardMappedSteps)
  const remsInfo = useAppSelector(state => state.remsInfo)

  const navigate = useNavigate()
  const params = useParams()
  const queryParams = useQuery()

  const { t } = useTranslation(["translation", "workflowSteps"])

  const submissionId = params.submissionId || ""
  const step = queryParams.get("step")
  const wizardStep = step ? Number(step) : -1

  const [isFetchingSubmission, setFetchingSubmission] = useState<boolean>(true)
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>({
    name: "",
    description: "",
    steps: [],
  })
  const [isValidStep, setValidStep] = useState<boolean>(true)

  const objectFormRef = useRef<HandlerRef>(undefined)

  // Get submission if URL parameters have submissionId. Redirect to home if invalid submissionId
  useEffect(() => {
    let isMounted = true
    const getSubmission = async () => {
      if (isMounted) {
        try {
          const response = await submissionAPIService.getSubmissionById(submissionId)
          if (response.status === 404) setValidStep(false) // Not a valid step if submissionId is not found
          dispatch(setSubmission(response.data))
          const workflowType = response.data.workflow
          dispatch(setWorkflowType(workflowType))
          /* Set objectTypesArray based on workflowType.
           * FEGAObjectTypes and BPObjectTypes could be decided in the future.
           */
          if (workflowType === WorkflowTypes.sd)
            dispatch(setObjectTypesArray(Object.keys(SDObjectTypes)))
          setFetchingSubmission(false)
        } catch (error) {
          navigate({ pathname: "" })
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "snackbarMessages.error.helperText.fetchSubmission",
            })
          )
          dispatch(resetSubmission())
        }
        dispatch(resetObjects())
        dispatch(resetCurrentObject())
      }
    }

    if (submissionId) getSubmission()
    return () => {
      isMounted = false
    }
  }, [submissionId, navigate, dispatch])

  useEffect(() => {
    let isMounted = true
    const getObjects = async () => {
      if (isMounted) {
        try {
          const response = await Promise.all(
            objectTypesArray.map(async objType => {
              const allObjs = await submissionAPIService.getAllObjectsByObjectType(
                submissionId,
                objType
              )
              const mappedObjs = allObjs.data.length
                ? allObjs.data.map(obj => ({
                    id: obj.objectId,
                    schema: obj.objectType,
                    displayTitle: obj.title,
                    ...obj,
                  }))
                : []

              return mappedObjs
            })
          )

          dispatch(setObjects(response))
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "snackbarMessages.error.helperText.fetchObjects",
            })
          )
          dispatch(resetObjects())
        }
      }
    }

    if (submissionId && workflowType !== WorkflowTypes.sd) getObjects()

    return () => {
      isMounted = false
    }
  }, [submissionId])

  useEffect(() => {
    let isMounted = true
    const getRemsInfo = async () => {
      if (isMounted) {
        try {
          const response = await remsAPIService.getRemsInfo()
          dispatch(setRemsInfo(response.data))
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "snackbarMessages.error.helperText.fetchRemsInfo",
            })
          )
        }
      }
    }

    getRemsInfo()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch workflow based on workflowType
  useEffect(() => {
    const getWorkflow = async () => {
      if (workflowType) {
        // Load 'workflow' JSON schema and validate the workflow's data against it.
        const workflowSchema = await loadJSONSchema("workflow")
        const workflowData = await loadJSONData<Workflow>(`workflows/${workflowType}`.toLowerCase())
        validateJSONData(workflowSchema, workflowData)
        setCurrentWorkflow(workflowData)

        // Get steps from the workflow and check for validStep
        if (
          !Number.isInteger(wizardStep) ||
          wizardStep < 0 ||
          wizardStep > workflowData.steps.length + 1
        )
          setValidStep(false)
      }
    }
    getWorkflow()
  }, [workflowType])

  useEffect(() => {
    const { mappedSteps } = WizardMapObjectsToStepHook(
      submission,
      objects,
      objectTypesArray,
      currentWorkflow,
      t,
      remsInfo
    )
    dispatch(setWizardMappedSteps(mappedSteps))
  }, [submission, objects, objectTypesArray, currentWorkflow, t])

  return isValidStep ? (
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
              {getStepContent(mappedSteps, wizardStep, objectType)}
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
