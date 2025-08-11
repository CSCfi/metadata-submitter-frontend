import React, { useEffect, useState } from "react"

import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { useNavigate, useLocation, Link as RouterLink } from "react-router"

import WizardAlert from "../SubmissionWizard/WizardComponents/WizardAlert"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus } from "constants/wizardObject"
import { SubmissionStatus } from "constants/wizardSubmission"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import {
  publishSubmissionContent,
  setSubmission,
  resetSubmission,
} from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"
import type { OldSubmissionRow } from "types"
import { pathWithLocale } from "utils"

interface SelectedSubmission {
  submissionId: string
  submissionTitle: string
  allObjects: OldSubmissionRow[]
  originalSubmissionData: Record<string, unknown>
  published: boolean
}

const SelectedSubmissionDetails: React.FC = () => {
  const dispatch = useAppDispatch()

  const [isFetchingSubmission, setFetchingSubmission] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SelectedSubmission>({
    submissionId: "",
    submissionTitle: "",
    allObjects: [],
    originalSubmissionData: {},
    published: false,
  })
  const currentSubmission = useAppSelector(state => state.submission)

  const submissionId = useLocation().pathname.split("/").pop()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Fetch submission data and map objects
  useEffect(() => {
    let isMounted = true

    const objectsArr: OldSubmissionRow[] = []

    // const handleObject = async (
    //   draft: boolean,
    //   objectType: string,
    //   objectInSubmission: CurrentFormObject
    // ) => {
    //   const service = draft ? draftAPIService : objectAPIService
    //   const response = await service.getObjectByAccessionId(objectType, objectInSubmission.id)

    //   if (response.ok) {
    // const objectDetails: OldSubmissionRow = {
    //   accessionId: objectInSubmission.id,
    //   title: getItemPrimaryText(objectInSubmission),
    //   objectType,
    //   lastModified: response.data.dateModified,
    //   objectData: response.data,
    // }
    // objectsArr.push(objectDetails)
    //   } else {
    //     dispatch(
    //       updateStatus({
    //         status: ResponseStatus.error,
    //         response: response,
    //         helperText: "snackbarMessages.error.helperText.fetchObject",
    //       })
    //     )
    //   }
    // }

    const getSubmission = async () => {
      if (submissionId) {
        const response = await submissionAPIService.getSubmissionById(submissionId)
        if (isMounted) {
          if (response.ok) {
            const data = response.data
            if (!data.published) {
              for (let i = 0; i < data.drafts?.length; i += 1) {
                // const objectType = data.drafts[i].schema.includes("draft-")
                //   ? data.drafts[i].schema.substr(6)
                //   : data.drafts[i].schema
                // await handleObject(true, objectType, data.drafts[i])
              }
            }
            // for (let i = 0; i < data.metadataObjects?.length; i += 1) {
            // const objectType = data.metadataObjects[i].schema
            // await handleObject(false, objectType, data.metadataObjects[i])
            // }

            setSelectedSubmission({
              submissionId: submissionId,
              originalSubmissionData: data,
              submissionTitle: data.name,
              allObjects: objectsArr,
              published: data.published,
            })

            setFetchingSubmission(false)
          } else {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: response,
                helperText: "snackbarMessages.error.helperText.fetchSubmission",
              })
            )
          }
        }
      }
    }
    getSubmission()
    return () => {
      isMounted = false
    }
  }, [dispatch, submissionId])

  const resetDispatch = () => {
    navigate(pathWithLocale("home"))
    dispatch(resetObjectType())
    dispatch(resetSubmission())
  }

  const handleEditSubmission = (step: number) => {
    dispatch(setSubmission(selectedSubmission.originalSubmissionData))
    navigate({
      pathname: pathWithLocale(
        `submission/${selectedSubmission.originalSubmissionData.submissionId}`
      ),
      search: `step=${step}`,
    })
  }

  const handlePublishSubmission = () => {
    dispatch(setSubmission(selectedSubmission.originalSubmissionData))
    setDialogOpen(true)
  }

  const handlePublish = (confirm: boolean) => {
    if (confirm) {
      dispatch(publishSubmissionContent(currentSubmission))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: JSON.parse(error),
              helperText: "snackbarMessages.error.helperText.submissionPublish",
            })
          )
        })
    } else {
      setDialogOpen(false)
    }
  }

  // Edit object
  const handleEditObject = async (objectId: string, objectType: string, objectStatus: string) => {
    const service = objectStatus === ObjectStatus.draft ? draftAPIService : objectAPIService
    const response = await service.getObjectByAccessionId(objectType, objectId)

    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, status: objectStatus }))
      dispatch(setObjectType(objectType))
      dispatch(setSubmission(selectedSubmission.originalSubmissionData))
      navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: `step=1` })
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "snackbarMessages.error.helperText.fetchDraft",
        })
      )
    }
  }

  // Delete object from current submission
  const handleDeleteObject = async (objectId: string, objectType: string, objectStatus: string) => {
    const service = objectStatus === ObjectStatus.draft ? draftAPIService : objectAPIService
    const response = await service.deleteObjectByAccessionId(objectType, objectId)
    if (response.ok) {
      const updatedSubmission = { ...selectedSubmission }
      updatedSubmission.allObjects = selectedSubmission.allObjects.filter(
        (item: { accessionId: string }) => item.accessionId !== objectId
      )
      setSelectedSubmission(updatedSubmission)
      dispatch(
        updateStatus({
          status: ResponseStatus.success,
          helperText: "snackbarMessages.success.objects.deleted",
        })
      )
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "snackbarMessages.error.helperText.deleteObject",
        })
      )
    }
  }

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
      sx={{ m: 2 }}
    >
      {isFetchingSubmission && <CircularProgress size={50} thickness={2.5} sx={{ m: 10 }} />}
      {!isFetchingSubmission && (
        <>
          <Breadcrumbs aria-label={t("ariaLabels.breadcrumb")} data-testid="breadcrumb">
            <Link color="inherit" component={RouterLink} to={pathWithLocale("home")}>
              Home
            </Link>
            <Link
              color="inherit"
              component={RouterLink}
              to={`${pathWithLocale("home")}/${selectedSubmission.published ? "published" : "drafts"}`}
            >
              {selectedSubmission.published ? "Published" : "Drafts"}
            </Link>
            <Typography color="textPrimary">{selectedSubmission.submissionTitle}</Typography>
          </Breadcrumbs>
          <SubmissionDetailTable
            bodyRows={selectedSubmission.allObjects}
            submissionTitle={selectedSubmission.submissionTitle}
            submissionType={
              selectedSubmission.published
                ? SubmissionStatus.published
                : SubmissionStatus.unpublished
            }
            location={selectedSubmission.published ? "published" : "drafts"}
            onEditSubmission={handleEditSubmission}
            onPublishSubmission={handlePublishSubmission}
            onEditObject={handleEditObject}
            onDeleteObject={handleDeleteObject}
          />
        </>
      )}
      {dialogOpen && (
        <WizardAlert
          onAlert={handlePublish}
          parentLocation="footer"
          alertType={"publish"}
        ></WizardAlert>
      )}
    </Grid>
  )
}

export default SelectedSubmissionDetails
