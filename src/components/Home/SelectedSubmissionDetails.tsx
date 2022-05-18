import React, { useEffect, useState } from "react"

import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom"

import WizardAlert from "../SubmissionWizard/WizardComponents/WizardAlert"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { SubmissionStatus } from "constants/wizardSubmission"
import { updateStatus } from "features/statusMessageSlice"
import { addDraftsToUser } from "features/userSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { publishSubmissionContent, setSubmission, resetSubmission } from "features/wizardSubmissionSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"
import type { OldSubmissionRow, ObjectInsideSubmissionWithTags } from "types"
import { getItemPrimaryText, pathWithLocale } from "utils"

const useStyles = makeStyles(() => ({
  tableGrid: {
    margin: 2,
  },
  circularProgress: {
    margin: 10,
  },
}))

interface SelectedSubmission {
  submissionId: string
  submissionTitle: string
  allObjects: OldSubmissionRow[]
  originalSubmissionData: Record<string, unknown>
  published: boolean
}

const SelectedSubmissionDetails: React.FC = () => {
  const classes = useStyles()
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

  // Fetch submission data and map objects
  useEffect(() => {
    let isMounted = true

    const objectsArr: OldSubmissionRow[] = []

    const handleObject = async (draft: boolean, objectType: string, objectInSubmission: ObjectInsideSubmissionWithTags) => {
      const service = draft ? draftAPIService : objectAPIService
      const response = await service.getObjectByAccessionId(objectType, objectInSubmission.accessionId)

      if (response.ok) {
        const objectDetails: OldSubmissionRow = {
          accessionId: objectInSubmission.accessionId,
          title: getItemPrimaryText(objectInSubmission),
          objectType,
          submissionType: objectInSubmission.tags.submissionType || ObjectSubmissionTypes.form, // Fallback for 'Form'. Used in drafts
          status: draft ? ObjectStatus.draft : ObjectStatus.submitted,
          lastModified: response.data.dateModified,
          objectData: response.data,
        }
        objectsArr.push(objectDetails)
      } else {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: response,
            helperText: "Object fetching error.",
          })
        )
      }
    }

    const getSubmission = async () => {
      if (submissionId) {
        const response = await submissionAPIService.getSubmissionById(submissionId)
        if (isMounted) {
          if (response.ok) {
            const data = response.data
            if (!data.published) {
              for (let i = 0; i < data.drafts?.length; i += 1) {
                const objectType = data.drafts[i].schema.includes("draft-")
                  ? data.drafts[i].schema.substr(6)
                  : data.drafts[i].schema

                await handleObject(true, objectType, data.drafts[i])
              }
            }
            for (let i = 0; i < data.metadataObjects?.length; i += 1) {
              const objectType = data.metadataObjects[i].schema
              await handleObject(false, objectType, data.metadataObjects[i])
            }

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
                helperText: "Fetching submissions error.",
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
      pathname: pathWithLocale(`submission/${selectedSubmission.originalSubmissionData.submissionId}`),
      search: `step=${step}`,
    })
  }

  const handlePublishSubmission = () => {
    dispatch(setSubmission(selectedSubmission.originalSubmissionData))
    setDialogOpen(true)
  }

  const handlePublish = (confirm: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => {
    if (confirm) {
      dispatch(publishSubmissionContent(currentSubmission))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: JSON.parse(error),
              helperText: `Couldn't publish submission with id ${selectedSubmission.originalSubmissionData.submissionId}`,
            })
          )
        })

      formData && formData?.length > 0
        ? dispatch(addDraftsToUser("current", formData)).catch((error: string) => {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: JSON.parse(error),
                helperText: "Can't save drafts for user",
              })
            )
          })
        : null
    } else {
      setDialogOpen(false)
    }
  }

  // Edit object
  const handleEditObject = async (
    objectId: string,
    objectType: string,
    objectStatus: string,
    submissionType: string
  ) => {
    const service = objectStatus === ObjectStatus.draft ? draftAPIService : objectAPIService
    const response = await service.getObjectByAccessionId(objectType, objectId)

    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, status: objectStatus }))
      dispatch(setSubmissionType(submissionType))
      dispatch(setObjectType(objectType))
      dispatch(setSubmission(selectedSubmission.originalSubmissionData))
      navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: `step=1` })
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Draft fetching error",
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
          helperText: "Object deleted",
        })
      )
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Can't delete object",
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
      className={classes.tableGrid}
    >
      {isFetchingSubmission && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {!isFetchingSubmission && (
        <>
          <Breadcrumbs aria-label="breadcrumb" data-testid="breadcrumb">
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
              selectedSubmission.published ? SubmissionStatus.published : SubmissionStatus.unpublished
            }
            location={selectedSubmission.published ? "published" : "drafts"}
            onEditSubmission={handleEditSubmission}
            onPublishSubmission={handlePublishSubmission}
            onEditObject={handleEditObject}
            onDeleteObject={handleDeleteObject}
          />
        </>
      )}
      {dialogOpen && <WizardAlert onAlert={handlePublish} parentLocation="footer" alertType={"publish"}></WizardAlert>}
    </Grid>
  )
}

export default SelectedSubmissionDetails
