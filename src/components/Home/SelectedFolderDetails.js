//@flow
import React, { useEffect, useState } from "react"

import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import makeStyles from '@mui/styles/makeStyles';
import Typography from "@mui/material/Typography"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom"

import WizardAlert from "../NewDraftWizard/WizardComponents/WizardAlert"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { addDraftsToUser } from "features/userSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { publishFolderContent, setFolder, resetFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import folderAPIService from "services/folderAPI"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText, pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  tableGrid: {
    margin: theme.spacing(2, 0),
  },
  circularProgress: {
    margin: theme.spacing(10, "auto"),
  },
}))

const SelectedFolderDetails = (): React$Element<typeof Grid> => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [isFetchingFolder, setFetchingFolder] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState({
    folderId: "",
    folderTitle: "",
    allObjects: [],
    originalFolderData: {},
    published: false,
  })
  const currentFolder = useSelector(state => state.submissionFolder)

  const folderId = useLocation().pathname.split("/").pop()
  const navigate = useNavigate()
  const objectsArr = []

  // Fetch folder data and map objects
  useEffect(() => {
    let isMounted = true

    const handleObject = async (data: any, draft: boolean, objectType: string, objectInFolder: any) => {
      const service = draft ? draftAPIService : objectAPIService
      const response = await service.getObjectByAccessionId(objectType, objectInFolder.accessionId)

      if (response.ok) {
        const objectDetails = {
          accessionId: objectInFolder.accessionId,
          title: getItemPrimaryText(objectInFolder),
          objectType,
          submissionType: objectInFolder.tags.submissionType || ObjectSubmissionTypes.form, // Fallback for 'Form'. Used in drafts
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

    const getFolder = async () => {
      const response = await folderAPIService.getFolderById(folderId)
      if (isMounted) {
        if (response.ok) {
          const data = response.data
          if (!data.published) {
            for (let i = 0; i < data.drafts?.length; i += 1) {
              const objectType = data.drafts[i].schema.includes("draft-")
                ? data.drafts[i].schema.substr(6)
                : data.drafts[i].schema

              await handleObject(data, true, objectType, data.drafts[i])
            }
          }
          for (let i = 0; i < data.metadataObjects?.length; i += 1) {
            const objectType = data.metadataObjects[i].schema
            await handleObject(data, false, objectType, data.metadataObjects[i])
          }

          setSelectedFolder({
            originalFolderData: data,
            folderTitle: data.name,
            allObjects: objectsArr,
            published: data.published,
          })

          setFetchingFolder(false)
        } else {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: response,
              helperText: "Fetching folders error.",
            })
          )
        }
      }
    }
    getFolder()
    return () => {
      isMounted = false
    }
  }, [])

  const resetDispatch = () => {
    navigate(pathWithLocale("home"))
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handleEditFolder = (step: number) => {
    dispatch(setFolder(selectedFolder.originalFolderData))
    navigate({
      pathname: pathWithLocale(`newdraft/${selectedFolder.originalFolderData.folderId}`),
      search: `step=${step}`,
    })
  }

  const handlePublishFolder = () => {
    dispatch(setFolder(selectedFolder.originalFolderData))
    setDialogOpen(true)
  }

  const handlePublish = (confirm, formData?: Array<ObjectInsideFolderWithTags>) => {
    if (confirm) {
      dispatch(publishFolderContent(currentFolder))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: JSON.parse(error),
              helperText: `Couldn't publish folder with id ${selectedFolder.originalFolderData.folderId}`,
            })
          )
        })

      formData && formData?.length > 0
        ? dispatch(addDraftsToUser("current", formData)).catch(error => {
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
      dispatch(setFolder(selectedFolder.originalFolderData))
      navigate({ pathname: pathWithLocale(`newdraft/${folderId}`), search: `step=1` })
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

  // Delete object from current folder
  const handleDeleteObject = async (objectId: string, objectType: string, objectStatus: string) => {
    const service = objectStatus === ObjectStatus.draft ? draftAPIService : objectAPIService
    const response = await service.deleteObjectByAccessionId(objectType, objectId)
    if (response.ok) {
      const updatedFolder = { ...selectedFolder }
      updatedFolder.allObjects = selectedFolder.allObjects.filter(item => item.accessionId !== objectId)
      setSelectedFolder(updatedFolder)
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
      {isFetchingFolder && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {!isFetchingFolder && (
        <>
          <Breadcrumbs aria-label="breadcrumb" data-testid="breadcrumb">
            <Link color="inherit" component={RouterLink} to={pathWithLocale("home")}>
              Home
            </Link>
            <Link
              color="inherit"
              component={RouterLink}
              to={`${pathWithLocale("home")}/${selectedFolder.published ? "published" : "drafts"}`}
            >
              {selectedFolder.published ? "Published" : "Drafts"}
            </Link>
            <Typography color="textPrimary">{selectedFolder.folderTitle}</Typography>
          </Breadcrumbs>
          <SubmissionDetailTable
            bodyRows={selectedFolder.allObjects}
            folderTitle={selectedFolder.folderTitle}
            folderType={
              selectedFolder.published ? FolderSubmissionStatus.published : FolderSubmissionStatus.unpublished
            }
            location={selectedFolder.published ? "published" : "drafts"}
            onEditFolder={handleEditFolder}
            onPublishFolder={handlePublishFolder}
            onEditObject={handleEditObject}
            onDeleteObject={handleDeleteObject}
          />
        </>
      )}
      {dialogOpen && <WizardAlert onAlert={handlePublish} parentLocation="footer" alertType={"publish"}></WizardAlert>}
    </Grid>
  )
}

export default SelectedFolderDetails
