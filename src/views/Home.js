//@flow
import React, { useEffect, useState } from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import { useDispatch, useSelector } from "react-redux"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import draftAPIService from "services/draftAPI"
import folderAPIService from "services/folderAPI"

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

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)
  const [openAllUnpublished, setOpenAllUnpublished] = useState(false)
  const [openAllPublished, setOpenAllPublished] = useState(false)

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
        console.log("unpublishedArr :>> ", unpublishedArr.slice(0, 5))
        console.log("publishedArr :>> ", publishedArr.slice(0, 5))
        dispatch(setUnpublishedFolders(unpublishedArr))
        dispatch(setPublishedFolders(publishedArr))
        setFetchingFolders(false)
      }
      fetchFolders()
    }
  }, [folderIds?.length])

  const handleClickFolder = async (folderId: string, folderType: string) => {
    if (folderType === "unpublished") {
      setConnError(false)
      const selectedFolder = unpublishedFolders.find(folder => folder.folderId === folderId)
      const draftObjects = selectedFolder.drafts
      for (let i = 0; i < draftObjects.length; i += 1) {
        const response = await draftAPIService.getObjectByAccessionId(
          draftObjects[i].schema.includes("draft-") ? draftObjects[i].schema.substr(6) : draftObjects[i].schema,
          draftObjects[i].accessionId
        )
        console.log("response :>> ", response)
      }
    }
  }

  // Contains both unpublished and published folders (max. 5 items/each)
  const overviewSubmissions = !isFetchingFolders && !openAllUnpublished && !openAllPublished && (
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
  const allUnpublishedSubmissions = (
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
  const allPublishedSubmissions = (
    <Collapse in={openAllPublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
      <Grid item xs={12} className={classes.tableCard}>
        <SubmissionIndexCard
          folderType="publishedCard"
          folders={publishedFolders}
          buttonTitle="Close"
          onClickContent={handleClickFolder}
          onClickButton={() => setOpenAllPublished(false)}
        />
      </Grid>
    </Collapse>
  )

  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        Logged in as: {user.name}
      </Grid>

      {isFetchingFolders && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {overviewSubmissions}
      {allUnpublishedSubmissions}
      {allPublishedSubmissions}

      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </Grid>
  )
}

export default Home
