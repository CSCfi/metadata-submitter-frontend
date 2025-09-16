import React, { useRef, useEffect, useState, RefObject } from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { useNavigate, useParams } from "react-router"

import WizardStepper from "components/SubmissionWizard/WizardComponents/WizardStepper"
import WizardAddObjectStep from "components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateSubmissionStep from "components/SubmissionWizard/WizardSteps/WizardCreateSubmissionStep"
import WizardDataBucketStep from "components/SubmissionWizard/WizardSteps/WizardDataBucketStep"
import WizardShowSummaryStep from "components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectTypes, ValidSteps } from "constants/wizardObject"
import { setObjectTypesArray } from "features/objectTypesArraySlice"
import { setRemsInfo } from "features/remsInfoSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setObjects, resetObjects } from "features/stepObjectSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setSubmission, resetSubmission } from "features/wizardSubmissionSlice"
import { setWorkflowType } from "features/workflowTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import objectAPIService from "services/objectAPI"
import remsAPIService from "services/remsAPI"
import schemaAPIService from "services/schemaAPI"
import submissionAPIService from "services/submissionAPI"
import type { HandlerRef } from "types"
import { getObjectDisplayTitle, useQuery } from "utils"
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
  switch (ValidSteps[wizardStep - 1]) {
    case "createSubmissionStep":
      return <WizardCreateSubmissionStep ref={createSubmissionFormRef} />
    case "dacPoliciesStep":
      return <WizardAddObjectStep formRef={objectFormRef} />
    case "dataBucketStep":
      return <WizardDataBucketStep />
    case "idPublishStep":
      // Datacite, Summary and Publish steps
      switch (objectType) {
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
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
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
      if (isMounted) {
        try {
          const response = await submissionAPIService.getSubmissionById(submissionId)

          dispatch(setSubmission(response.data))
          dispatch(setWorkflowType(response.data.workflow))
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
    const getSchemas = async () => {
      if (isMounted) {
        let cachedObjectTypesArray = sessionStorage.getItem(`cached_objectTypesArray`) || ""
        if (!cachedObjectTypesArray) {
          try {
            const response = await schemaAPIService.getAllSchemas()
            const exceptionalSchemas = ["Project", "Submission"]
            const objectTypesArray = response.data.reduce((arr, val) => {
              if (!exceptionalSchemas.includes(val.title)) {
                val.title.toLowerCase().includes(ObjectTypes.datacite)
                  ? arr.push(ObjectTypes.datacite)
                  : arr.push(val.title.toLowerCase())
              }
              return arr
            }, [])
            cachedObjectTypesArray = JSON.stringify(objectTypesArray)
            sessionStorage.setItem(`cached_objectTypesArray`, cachedObjectTypesArray)
          } catch (error) {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: error,
                helperText: "snackbarMessages.error.helperText.fetchSchemas",
              })
            )
          }
        }

        try {
          dispatch(setObjectTypesArray(JSON.parse(cachedObjectTypesArray)))
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "snackbarMessages.error.helperText.fetchSchemas",
            })
          )
        }
      }
    }

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

    getSchemas()
    getRemsInfo()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const getObjects = async () => {
      if (isMounted) {
        try {
          const response = (
            await Promise.all(
              objectTypesArray.map(async objType => {
                const allObjs = await objectAPIService.getAllObjectsByObjectType(
                  objType,
                  submissionId
                )
                const mappedObjs = allObjs.data.length
                  ? await Promise.all(
                      allObjs.data.map(async obj => {
                        const { objectId, schema, ...rest } = obj
                        const objData = await objectAPIService.getObjectByAccessionId(
                          schema,
                          objectId
                        )
                        const objTitle = getObjectDisplayTitle(schema, objData.data)
                        return {
                          id: objectId,
                          schema,
                          displayTitle: objTitle,
                          ...rest,
                        }
                      })
                    )
                  : []

                return mappedObjs
              })
            )
          ).flat()

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

    if (submissionId) getObjects()

    return () => {
      isMounted = false
    }
  }, [objectTypesArray])

  const wizardStep = step ? Number(step) : -1

  const createSubmissionFormRef = useRef<HandlerRef>(null)

  const objectFormRef = useRef<HandlerRef>(undefined)

  return wizardStep > 0 && ValidSteps.length >= wizardStep ? (
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
