//@flow
import React, { useEffect, useState } from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useDispatch, useSelector } from "react-redux"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { WizardStatus } from "constants/wizardStatus"
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

const Home = (): React$Element<typeof Grid> => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)

  const unpublishedFolders = useSelector(state => state.unpublishedFolders)
  const publishedFolders = useSelector(state => state.publishedFolders)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)

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

  // Contains both unpublished and published folders (max. 5 items/each)
  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        <Typography color="textPrimary">Logged in as: {user.name}</Typography>
      </Grid>

      {isFetchingFolders && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {!isFetchingFolders && (
        <>
          <Grid item xs={12} className={classes.tableCard}>
            <SubmissionIndexCard
              folderType={FolderSubmissionStatus.unpublished}
              folders={unpublishedFolders.slice(0, 5)}
              location="drafts"
              displayButton={true}
            />
          </Grid>
          <Divider variant="middle" />
          <Grid item xs={12} className={classes.tableCard}>
            <SubmissionIndexCard
              folderType={FolderSubmissionStatus.published}
              folders={publishedFolders.slice(0, 5)}
              location="published"
              displayButton={true}
            />
          </Grid>
        </>
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

export default Home
