import React, { useRef, useEffect, useState } from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { makeStyles } from "@mui/styles"
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
import type { CreateSubmissionFormRef } from "types"
import { useQuery, pathWithLocale } from "utils"
import Page404 from "views/ErrorPages/Page404"

const useStyles = makeStyles(theme => ({
  container: {
    flex: "1 0 auto",
    padding: 0,
  },
  gridContainer: {
    marginTop: theme.spacing(7.7),
    minHeight: "calc(100vh - 137px)",
    backgroundColor: theme.palette.background.default,
    "& .MuiGrid-item": { paddingTop: 0 },
  },
  stepper: {
    paddingTop: "0 !important",
    backgroundColor: theme.palette.primary.main,
  },
  stepContent: {
    paddingLeft: `${theme.spacing(5)} !important`,
    paddingRight: `${theme.spacing(5)} !important`,
  },
  paper: {
    padding: 0,
    height: "100%",
  },
}))

/**
 * Return correct content for each step
 */
const getStepContent = (wizardStep: number, createSubmissionFormRef: CreateSubmissionFormRef) => {
  switch (wizardStep) {
    case 1:
      return <WizardCreateSubmissionStep createSubmissionFormRef={createSubmissionFormRef} />
    case 2:
    case 3:
    case 4:
      return <WizardAddObjectStep />
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
  const classes = useStyles()
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

  return (
    <Container maxWidth={false} className={classes.container} disableGutters>
      <Grid container className={classes.gridContainer}>
        <Grid item xs={3} className={classes.stepper}>
          <WizardStepper />
        </Grid>
        <Grid item xs={9} className={classes.stepContent}>
          {isFetchingSubmission && submissionId && <LinearProgress />}
          {(!isFetchingSubmission || !submissionId) && (
            <Paper className={classes.paper} elevation={2}>
              <div className={classes.paperContent}>{getStepContent(wizardStep, createSubmissionFormRef)}</div>
            </Paper>
          )}
        </Grid>
      </Grid>

      <WizardFooter />
    </Container>
  )
}

export default SubmissionWizard
