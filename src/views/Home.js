//@flow
import React, { useEffect, useState } from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import SubmissionDetailTable from "components/Home/SubmissionDetailTable"
import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { setSelectedFolder, resetSelectedFolder, deleteObjectFromSelectedFolder } from "features/selectedFolderSlice"
import { setUnpublishedFolders, deleteFolderFromUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import draftAPIService from "services/draftAPI"
import folderAPIService from "services/folderAPI"
import objectAPIService from "services/objectAPI"

const useStyles = makeStyles(theme => ({
  tableCard: {
    margin: theme.spacing(1, 0),
  },
  loggedUser: {
    margin: theme.spacing(2, 0, 0),
  },
  circularProgress: {
    margin: theme.spacing(10, "auto"),
  },
}))

const Home = (): React$Element<typeof Grid> => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)

  const unpublishedFolders = useSelector(state => state.unpublishedFolders)
  const publishedFolders = useSelector(state => state.publishedFolders)
  const selectedFolder = useSelector(state => state.selectedFolder)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)
  // Use deepLevel to indicate which parts of Home to render
  const [deepLevel, setDeepLevel] = useState(0)

  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      const response = await folderAPIService.getFolders()
      if (isMounted) {
        if (response.ok) {
          dispatch(setUnpublishedFolders(response.data.folders.filter(folder => folder.published === false)))
          dispatch(setPublishedFolders(response.data.folders.filter(folder => folder.published === true)))
          setFetchingFolders(false)
        } else {
          setConnError(true)
          setResponseError(response)
          setErrorPrefix("Fetching folders error.")
        }
      }
    }
    getFolders()
    return () => {
      isMounted = false
    }
  }, [])

  // Handle fetching details of all objects (drafts + metadata) of the clicked folder
  const handleClickFolder = async (currentFolderId: string, folderType: string) => {
    setDeepLevel(3)
    const folders = folderType === FolderSubmissionStatus.published ? publishedFolders : unpublishedFolders
    const currentFolder = folders.find(folder => folder.folderId === currentFolderId)

    const draftObjects = currentFolder?.drafts
    const submittedObjects = currentFolder?.metadataObjects

    setConnError(false)

    const objectsArr = []

    if (folderType === FolderSubmissionStatus.unpublished) {
      for (let i = 0; i < draftObjects?.length; i += 1) {
        const objectType = draftObjects[i].schema.includes("draft-")
          ? draftObjects[i].schema.substr(6)
          : draftObjects[i].schema
        const response = await draftAPIService.getObjectByAccessionId(objectType, draftObjects[i].accessionId)

        if (response.ok) {
          const draftObjectDetails = {
            accessionId: draftObjects[i].accessionId,
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

    for (let j = 0; j < submittedObjects?.length; j += 1) {
      const objectType = submittedObjects[j].schema
      const response = await objectAPIService.getObjectByAccessionId(objectType, submittedObjects[j].accessionId)
      if (response.ok) {
        const submittedObjectDetails = {
          accessionId: submittedObjects[j].accessionId,
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
    dispatch(setSelectedFolder({ ...currentFolder, allObjects: objectsArr }))
  }

  // Handle from <SelectedFolderDetails /> back to <OverviewSubmissions />
  const handleGoBack = () => {
    selectedFolder.published ? setDeepLevel(2) : setDeepLevel(1)
    dispatch(resetSelectedFolder())
  }

  // Delete object from current selectedFolder
  const handleDeleteObject = (objectId: string, objectType: string, objectStatus: string) => {
    dispatch(deleteObjectFromSelectedFolder(objectId, objectType, objectStatus)).catch(error => {
      setConnError(true)
      setResponseError(JSON.parse(error))
      setErrorPrefix("Can't delete object")
    })
    dispatch(deleteFolderFromUnpublishedFolders(selectedFolder, objectId, objectStatus))
  }

  // Contains both unpublished and published folders (max. 5 items/each)
  const OverviewSubmissions = () =>
    !isFetchingFolders &&
    deepLevel === 0 && (
      <>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType={FolderSubmissionStatus.unpublished}
            folders={unpublishedFolders.slice(0, 5)}
            buttonTitle="See all"
            onClickHeader={() => setDeepLevel(1)}
            onClickContent={handleClickFolder}
            onClickButton={() => setDeepLevel(1)}
          />
        </Grid>
        <Divider variant="middle" />
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType={FolderSubmissionStatus.published}
            folders={publishedFolders.slice(0, 5)}
            buttonTitle="See all"
            onClickHeader={() => setDeepLevel(2)}
            onClickContent={handleClickFolder}
            onClickButton={() => setDeepLevel(2)}
          />
        </Grid>
      </>
    )

  // Full list of unpublished folders
  const AllUnpublishedSubmissions = () =>
    deepLevel === 1 && (
      <Collapse in={deepLevel === 1} collapsedHeight={0} timeout={{ enter: 1500 }}>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType={FolderSubmissionStatus.unpublished}
            folders={unpublishedFolders}
            buttonTitle="Close"
            onClickContent={handleClickFolder}
            onClickButton={() => setDeepLevel(0)}
          />
        </Grid>
      </Collapse>
    )

  // Full list of published folders
  const AllPublishedSubmissions = () =>
    deepLevel === 2 && (
      <Collapse in={deepLevel === 2} collapsedHeight={0} timeout={{ enter: 1500 }}>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType={FolderSubmissionStatus.published}
            folders={publishedFolders}
            buttonTitle="Close"
            onClickContent={handleClickFolder}
            onClickButton={() => setDeepLevel(0)}
          />
        </Grid>
      </Collapse>
    )

  // Detail of selected folder, list all of its objects (draft + submitted)
  const SelectedFolderDetails = () =>
    deepLevel === 3 && (
      <Collapse in={deepLevel === 3} collapsedHeight={0}>
        <SubmissionDetailTable
          bodyRows={selectedFolder.allObjects}
          folderTitle={selectedFolder.name}
          folderType={selectedFolder.published ? FolderSubmissionStatus.published : FolderSubmissionStatus.unpublished}
          onClickCardHeader={handleGoBack}
          onDelete={handleDeleteObject}
        />
      </Collapse>
    )

  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        Logged in as: {user.name}
      </Grid>

      {isFetchingFolders && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      <OverviewSubmissions />
      <AllUnpublishedSubmissions />
      <AllPublishedSubmissions />

      <SelectedFolderDetails />

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

export default Home
