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
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { setSelectedFolder, resetSelectedFolder } from "features/selectedFolderSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
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

const Home = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const folderIds = user.folders
  const unpublishedFolders = useSelector(state => state.unpublishedFolders)
  const publishedFolders = useSelector(state => state.publishedFolders)
  const selectedFolder = useSelector(state => state.selectedFolder)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)
  const [openAllUnpublished, setOpenAllUnpublished] = useState(false)
  const [openAllPublished, setOpenAllPublished] = useState(false)
  const [openSelectedFolder, setOpenSelectedFolder] = useState(false)

  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    if (folderIds) {
      const unpublishedArr = []
      const publishedArr = []
      const fetchFolders = async () => {
        for (let i = 0; i < folderIds.length; i += 1) {
          const response = await folderAPIService.getFolderById(folderIds[i])
          if (response.ok) {
            response.data.published ? publishedArr.push(response.data) : unpublishedArr.push(response.data)
          } else {
            setConnError(true)
            setResponseError(response)
            setErrorPrefix("Fetching folders error.")
          }
        }
        dispatch(setUnpublishedFolders(unpublishedArr))
        dispatch(setPublishedFolders(publishedArr))
        setFetchingFolders(false)
      }
      fetchFolders()
    }
  }, [folderIds?.length])

  const handleClickFolder = async (selectedFolderId: string, folderType: string) => {
    setOpenSelectedFolder(true)
    const folders = folderType === "published" ? publishedFolders : unpublishedFolders
    const selectedFolder = folders.find(folder => folder.folderId === selectedFolderId)

    const draftObjects = selectedFolder?.drafts
    const submittedObjects = selectedFolder?.metadataObjects
    setConnError(false)

    const objectsArr = []

    if (folderType === "unpublished") {
      for (let i = 0; i < draftObjects?.length; i += 1) {
        const objectType = draftObjects[i].schema.includes("draft-")
          ? draftObjects[i].schema.substr(6)
          : draftObjects[i].schema
        const response = await draftAPIService.getObjectByAccessionId(objectType, draftObjects[i].accessionId)

        if (response.ok) {
          const draft = {
            title: response.data.descriptor?.studyTitle,
            objectType,
            status: "Draft",
            lastModified: response.data.dateModified,
          }
          objectsArr.push(draft)
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
        const submitted = {
          title: response.data.descriptor?.studyTitle,
          objectType,
          status: "Submitted",
          lastModified: response.data.dateModified,
        }
        objectsArr.push(submitted)
      } else {
        setConnError(true)
        setResponseError(response)
        setErrorPrefix("Fetching folder error.")
      }
    }
    dispatch(
      setSelectedFolder({
        id: selectedFolder.folderId,
        name: selectedFolder.name,
        description: selectedFolder.description,
        published: selectedFolder.published,
        objects: objectsArr,
      })
    )
  }

  // Handle from <SelectedFolderDetails /> back to <OverviewSubmissions />
  const handleGoBack = () => {
    setOpenSelectedFolder(false)
    dispatch(resetSelectedFolder())
  }

  // Contains both unpublished and published folders (max. 5 items/each)
  const OverviewSubmissions = () =>
    !isFetchingFolders &&
    !openAllUnpublished &&
    !openAllPublished &&
    !openSelectedFolder && (
      <>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType="unpublished"
            folders={unpublishedFolders.slice(0, 5)}
            buttonTitle="See all"
            onClickHeader={() => setOpenAllUnpublished(true)}
            onClickContent={handleClickFolder}
            onClickButton={() => setOpenAllUnpublished(true)}
          />
        </Grid>
        <Divider variant="middle" />
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType="published"
            folders={publishedFolders.slice(0, 5)}
            buttonTitle="See all"
            onClickHeader={() => setOpenAllPublished(true)}
            onClickContent={handleClickFolder}
            onClickButton={() => setOpenAllPublished(true)}
          />
        </Grid>
      </>
    )

  // Full list of unpublished folders
  const AllUnpublishedSubmissions = () =>
    !openSelectedFolder && (
      <Collapse in={openAllUnpublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType="unpublished"
            folders={unpublishedFolders}
            buttonTitle="Close"
            onClickContent={handleClickFolder}
            onClickButton={() => setOpenAllUnpublished(false)}
          />
        </Grid>
      </Collapse>
    )

  // Full list of published folders
  const AllPublishedSubmissions = () =>
    !openSelectedFolder && (
      <Collapse in={openAllPublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
        <Grid item xs={12} className={classes.tableCard}>
          <SubmissionIndexCard
            folderType="published"
            folders={publishedFolders}
            buttonTitle="Close"
            onClickContent={handleClickFolder}
            onClickButton={() => setOpenAllPublished(false)}
          />
        </Grid>
      </Collapse>
    )

  const SelectedFolderDetails = () => (
    <Collapse in={openSelectedFolder} collapsedHeight={0}>
      <SubmissionDetailTable
        bodyRows={selectedFolder.objects}
        folderTitle={selectedFolder.name}
        folderType={selectedFolder.published ? "published" : "draft"}
        onClickCardHeader={handleGoBack}
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
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </Grid>
  )
}

export default Home
