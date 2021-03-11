//@flow
import React, { useEffect, useState } from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
// import { useDispatch } from "react-redux"
import { useLocation } from "react-router-dom"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
// import { deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import folderAPIService from "services/folderAPI"
import objectAPIService from "services/objectAPI"

const useStyles = makeStyles(theme => ({
  tableGrid: {
    margin: theme.spacing(1, 0),
  },
  circularProgress: {
    margin: theme.spacing(10, "auto"),
  },
}))

const SelectedFolderDetails = (): React$Element<typeof Grid> => {
  const classes = useStyles()
  // const dispatch = useDispatch()
  const [isFetchingFolder, setFetchingFolder] = useState(true)
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")
  const [selectedFolder, setSelectedFolder] = useState({
    folderTitle: "",
    allObjects: [],
    published: "",
  })

  const folderId = useLocation().pathname.split("/").pop()

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
          setSelectedFolder({ folderTitle: data.name, allObjects: objectsArr, published: data.published })

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

  // Delete object from current folder
  const handleDeleteObject = async (objectId: string, objectType: string, objectStatus: string) => {
    console.log(objectStatus)
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

  // const handleDeleteObject = (objectId: string, objectType: string, objectStatus: string) => {
  //   setConnError(false)
  //   dispatch(deleteObjectFromFolder(objectStatus, objectId, objectType))
  //     .then(() => {
  //       const updatedFolder = { ...selectedFolder }
  //       updatedFolder.allObjects = selectedFolder.allObjects.filter(item => item.accessionId !== objectId)
  //       setSelectedFolder(updatedFolder)
  //     })
  //     .catch(error => {
  //       console.log(error)
  //       setConnError(true)
  //       setResponseError(JSON.parse(error))
  //       setErrorPrefix("Can't delete object")
  //     })
  // }

  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch" className={classes.tableGrid}>
      {isFetchingFolder && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {!isFetchingFolder && (
        <SubmissionDetailTable
          bodyRows={selectedFolder.allObjects}
          folderTitle={selectedFolder.folderTitle}
          folderType={selectedFolder.published ? FolderSubmissionStatus.published : FolderSubmissionStatus.unpublished}
          location={selectedFolder.published ? "published" : "drafts"}
          onDelete={handleDeleteObject}
        />
      )}
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
