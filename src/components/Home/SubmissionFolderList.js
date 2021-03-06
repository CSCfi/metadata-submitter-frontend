//@flow
import React, { useEffect, useState } from "react"

import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import CircularProgress from "@material-ui/core/CircularProgress"
import Grid from "@material-ui/core/Grid"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, Link as RouterLink } from "react-router-dom"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { WizardStatus } from "constants/wizardStatus"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import folderAPIService from "services/folderAPI"

const useStyles = makeStyles(theme => ({
  folderGrid: {
    margin: theme.spacing(2, 0),
  },
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

const SubmissionFolderList = (): React$Element<typeof Grid> => {
  const dispatch = useDispatch()

  const unpublishedFolders = useSelector(state => state.unpublishedFolders)
  const publishedFolders = useSelector(state => state.publishedFolders)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)

  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  const location = useLocation().pathname.split("/").pop()

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

  // Full list of folders
  const Submissions = () => (
    <Grid item xs={12} className={classes.tableCard}>
      <SubmissionIndexCard
        folderType={location === "drafts" ? FolderSubmissionStatus.unpublished : FolderSubmissionStatus.published}
        folders={location === "drafts" ? unpublishedFolders : publishedFolders}
        location={location}
      />
    </Grid>
  )

  return (
    <Grid className={classes.folderGrid} container direction="column" justify="space-between" alignItems="stretch">
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" component={RouterLink} to={`/home`}>
          Home
        </Link>
        <Typography color="textPrimary">{location.charAt(0).toUpperCase() + location.slice(1)}</Typography>
      </Breadcrumbs>
      {isFetchingFolders && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {!isFetchingFolders && (
        <>
          <Submissions />
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

export default SubmissionFolderList
