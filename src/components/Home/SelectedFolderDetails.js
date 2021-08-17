//@flow
import React, { useEffect, useState } from "react"

import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import CircularProgress from "@material-ui/core/CircularProgress"
import Grid from "@material-ui/core/Grid"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useDispatch, useSelector } from "react-redux"
import { useHistory, useLocation, Link as RouterLink } from "react-router-dom"

import WizardAlert from "../NewDraftWizard/WizardComponents/WizardAlert"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { addDraftsToUser } from "features/userSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { publishFolderContent, setFolder, resetFolder } from "features/wizardSubmissionFolderSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import folderAPIService from "services/folderAPI"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideFolderWithTags } from "types"

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
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")
  const [selectedFolder, setSelectedFolder] = useState({
    folderId: "",
    folderTitle: "",
    allObjects: [],
    originalFolderData: {},
    published: false,
  })
  const currentFolder = useSelector(state => state.submissionFolder)

  const folderId = useLocation().pathname.split("/").pop()
  let history = useHistory()
  const objectsArr = []

  // Fetch folder data and map objects
  useEffect(() => {
    let isMounted = true
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
              const response = await draftAPIService.getObjectByAccessionId(objectType, data.drafts[i].accessionId)
              if (response.ok) {
                const draftObjectDetails = {
                  accessionId: data.drafts[i].accessionId,
                  title: response.data.descriptor?.studyTitle,
                  objectType,
                  submissionType: ObjectSubmissionTypes.form, // Only forms can be drafts
                  status: ObjectStatus.draft,
                  lastModified: response.data.dateModified,
                }
                objectsArr.push(draftObjectDetails)
              } else {
                setConnError(true)
                setResponseError(response)
                setErrorPrefix("Fetching folder error.")
              }
            }
          }
          for (let j = 0; j < data.metadataObjects?.length; j += 1) {
            const objectType = data.metadataObjects[j].schema
            const response = await objectAPIService.getObjectByAccessionId(
              objectType,
              data.metadataObjects[j].accessionId
            )
            if (response.ok) {
              const submittedObjectDetails = {
                accessionId: data.metadataObjects[j].accessionId,
                title: response.data.descriptor?.studyTitle,
                objectType,
                submissionType: data.metadataObjects[j].tags.submissionType,
                status: ObjectStatus.submitted,
                lastModified: response.data.dateModified,
              }
              objectsArr.push(submittedObjectDetails)
            } else {
              setConnError(true)
              setResponseError(response)
              setErrorPrefix("Fetching folder error.")
            }
          }
          setSelectedFolder({
            originalFolderData: data,
            folderTitle: data.name,
            allObjects: objectsArr,
            published: data.published,
          })

          setFetchingFolder(false)
        } else {
          setConnError(true)
          setResponseError(response)
          setErrorPrefix("Fetching folders error.")
        }
      }
    }
    getFolder()
    return () => {
      isMounted = false
    }
  }, [])

  const resetDispatch = () => {
    history.push("/home")
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handleEditFolder = (step: number) => {
    dispatch(setFolder(selectedFolder.originalFolderData))
    history.push(`/newdraft?step=${step}`)
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
          setConnError(true)
          setResponseError(JSON.parse(error))
          setErrorPrefix(`Couldn't publish folder with id ${selectedFolder.originalFolderData.folderId}`)
        })

      formData && formData?.length > 0
        ? dispatch(addDraftsToUser("current", formData)).catch(error => {
            setConnError(true)
            setResponseError(JSON.parse(error))
            setErrorPrefix("Can't save drafts for user")
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
      history.push("/newdraft?step=1")
    } else {
      setConnError(true)
      setResponseError(response)
      setErrorPrefix("Draft fetching error")
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
    } else {
      setConnError(true)
      setResponseError(JSON.parse(response))
      setErrorPrefix("Can't delete object")
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
            <Link color="inherit" component={RouterLink} to={`/home`}>
              Home
            </Link>
            <Link
              color="inherit"
              component={RouterLink}
              to={`/home/${selectedFolder.published ? "published" : "drafts"}`}
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
      {connError && (
        <WizardStatusMessageHandler
          successStatus={WizardStatus.error}
          response={responseError}
          prefixText={errorPrefix}
        />
      )}
    </Grid>
  )
}

export default SelectedFolderDetails
