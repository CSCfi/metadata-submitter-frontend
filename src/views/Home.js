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
            response.data.published ? publishedArr.push(response.data.name) : unpublishedArr.push(response.data.name)
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

  // Contains both unpublished and published folders (max. 5 items/each)
  const overviewSubmissions = !isFetchingFolders && !openAllUnpublished && !openAllPublished && (
    <>
      <Grid item xs={12} className={classes.tableCard}>
        <SubmissionIndexCard
          folderType="unpublished"
          folderTitles={unpublishedFolders.slice(0, 5)}
          buttonTitle="See all"
          onClickHeader={() => {}}
          onClickContent={() => {}}
          onClickButton={() => setOpenAllUnpublished(true)}
        />
      </Grid>
      <Divider variant="middle" />
      <Grid item xs={12} className={classes.tableCard}>
        <SubmissionIndexCard
          folderType="published"
          folderTitles={publishedFolders.slice(0, 5)}
          buttonTitle="See all"
          onClickHeader={() => {}}
          onClickContent={() => {}}
          onClickButton={() => setOpenAllPublished(true)}
        />
      </Grid>
    </>
  )

  // Full list of unpublished folders
  const allUnpublishedSubmissions = (
    <Collapse in={openAllUnpublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
      <SubmissionIndexCard
        folderType="unpublished"
        folderTitles={unpublishedFolders}
        buttonTitle="Close"
        onClickHeader={() => {}}
        onClickContent={() => {}}
        onClickButton={() => setOpenAllUnpublished(false)}
      />
    </Collapse>
  )

  // Full list of published folders
  const allPublishedSubmissions = (
    <Collapse in={openAllPublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
      <SubmissionIndexCard
        folderType="publishedCard"
        folderTitles={publishedFolders}
        buttonTitle="Close"
        onClickHeader={() => {}}
        onClickContent={() => {}}
        onClickButton={() => setOpenAllPublished(false)}
      />
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
