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
import WizardCreateFolderStep from "components/SubmissionWizard/WizardSteps/WizardCreateFolderStep"
import WizardShowSummaryStep from "components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { setFolder, resetFolder } from "features/wizardSubmissionFolderSlice"
import { useAppDispatch } from "hooks"
import folderAPIService from "services/folderAPI"
import type { CreateFolderFormRef } from "types"
import { useQuery, pathWithLocale } from "utils"
import Page404 from "views/ErrorPages/Page404"

const useStyles = makeStyles(theme => ({
  paper: {
    alignItems: "stretch",
  },
  paperContent: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "start",
    flexDirection: "column",
  },
  container: {
    flex: "1 0 auto",
    padding: 0,
  },
  gridContainer: {
    marginTop: theme.spacing(7.7),
    minHeight: "calc(100vh - 137px)",
    backgroundColor: theme.palette.background.wizard,
  },
  stepper: {
    paddingTop: "0 !important",
    backgroundColor: theme.palette.primary.main,
  },
  stepContent: {
    paddingTop: `${theme.spacing(5)} !important`,
    paddingLeft: `${theme.spacing(5)} !important`,
  },
}))

/**
 * Return correct content for each step
 */
const getStepContent = (wizardStep: number, createFolderFormRef: CreateFolderFormRef) => {
  switch (wizardStep) {
    case 1:
      return <WizardCreateFolderStep createFolderFormRef={createFolderFormRef} />
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
  const [isFetchingFolder, setFetchingFolder] = useState(true)

  const step = queryParams.get("step")

  const folderId = params.folderId || ""

  // Get folder if URL parameters have folderId. Redirect to home if invalid folderId
  useEffect(() => {
    let isMounted = true
    const getFolder = async () => {
      const response = await folderAPIService.getFolderById(folderId)
      if (isMounted) {
        if (response.ok) {
          dispatch(setFolder(response.data))

          setFetchingFolder(false)
        } else {
          navigate({ pathname: pathWithLocale("submission"), search: "step=1" })
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: response,
              helperText: "Fetching folder error.",
            })
          )
          dispatch(resetFolder())
        }
      }
    }
    if (folderId) getFolder()
    return () => {
      isMounted = false
    }
  }, [dispatch, folderId, navigate])

  const wizardStep = step ? Number(step) : -1

  const createFolderFormRef = useRef<null | (HTMLFormElement & { changeCallback: () => void })>(null)

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={3} className={classes.stepper}>
          <WizardStepper />
        </Grid>
        <Grid item xs={7} className={classes.stepContent}>
          {isFetchingFolder && folderId && <LinearProgress />}
          {(!isFetchingFolder || !folderId) && (
            <Paper className={classes.paper} elevation={2}>
              <div className={classes.paperContent}>{getStepContent(wizardStep, createFolderFormRef)}</div>
            </Paper>
          )}
        </Grid>
      </Grid>

      <WizardFooter />
    </Container>
  )
}

export default SubmissionWizard
