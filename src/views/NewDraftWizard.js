//@flow
import React, { useRef, useEffect, useState } from "react"

import Container from "@mui/material/Container"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import { makeStyles } from "@mui/styles"
import { useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import WizardFooter from "components/NewDraftWizard/WizardComponents/WizardFooter"
import WizardAddObjectStep from "components/NewDraftWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateFolderStep from "components/NewDraftWizard/WizardSteps/WizardCreateFolderStep"
import WizardShowSummaryStep from "components/NewDraftWizard/WizardSteps/WizardShowSummaryStep"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { setFolder, resetFolder } from "features/wizardSubmissionFolderSlice"
import folderAPIService from "services/folderAPI"
import type { CreateFolderFormRef } from "types"
import { useQuery, pathWithLocale } from "utils"
import Page404 from "views/ErrorPages/Page404"

const useStyles = makeStyles(theme => ({
  paper: {
    alignItems: "stretch",
  },
  paperFirstStep: {
    padding: theme.spacing(4),
    alignItems: "stretch",
    width: "60%",
    margin: theme.spacing(10, "auto"),
  },
  paperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  container: {
    flex: "1 0 auto",
    padding: 0,
  },
}))

/**
 * Return correct content for each step
 */
const getStepContent = (wizardStep: number, createFolderFormRef: CreateFolderFormRef) => {
  switch (wizardStep) {
    case 0:
      return <WizardCreateFolderStep createFolderFormRef={createFolderFormRef} />
    case 1:
      return <WizardAddObjectStep />
    case 2:
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
const NewDraftWizard = (): React$Element<typeof Container> => {
  const dispatch = useDispatch()
  const classes = useStyles()
  const navigate = useNavigate()
  const params = useParams()
  const queryParams = useQuery()
  const [isFetchingFolder, setFetchingFolder] = useState(true)

  const step = queryParams.get("step")

  const folderId = params.folderId

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
          navigate({ pathname: pathWithLocale("newdraft"), search: "step=0" })
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
  }, [folderId])

  let wizardStep = step ? Number(step) : -1

  const createFolderFormRef = useRef<null | (HTMLFormElement & { changeCallback: Function })>(null)

  return (
    <Container maxWidth={false} className={classes.container}>
      {isFetchingFolder && folderId && <LinearProgress />}
      {(!isFetchingFolder || !folderId) && (
        <Paper className={wizardStep < 0 ? classes.paperFirstStep : classes.paper} elevation={wizardStep < 0 ? 2 : 0}>
          <div className={classes.paperContent}>{getStepContent(wizardStep, createFolderFormRef)}</div>
        </Paper>
      )}
      <WizardFooter />
    </Container>
  )
}

export default NewDraftWizard
