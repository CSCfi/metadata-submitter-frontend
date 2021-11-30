//@flow
import React, { useEffect, useState } from "react"

import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import UserDraftTemplates from "components/Home/UserDraftTemplates"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setTotalFolders } from "features/totalFoldersSlice"
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

  const { t } = useTranslation()

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      const unpublishedResponse = await folderAPIService.getFolders({ page: 1, per_page: 10, published: false })
      const publishedResponse = await folderAPIService.getFolders({ page: 1, per_page: 10, published: true })

      if (isMounted) {
        if (unpublishedResponse.ok && publishedResponse.ok) {
          dispatch(setUnpublishedFolders(unpublishedResponse.data.folders))
          dispatch(setPublishedFolders(publishedResponse.data.folders))
          dispatch(
            setTotalFolders({
              totalUnpublishedFolders: unpublishedResponse.data.page.totalFolders,
              totalPublishedFolders: publishedResponse.data.page.totalFolders,
            })
          )
          setFetchingFolders(false)
        } else {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: !unpublishedResponse.ok ? unpublishedResponse : publishedResponse,
              helperText: "Fetching folders error.",
            })
          )
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
    <Grid container direction="column" justifyContent="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        <Typography color="textPrimary" data-testid="logged-in-as">
          {t("Logged in as")}: {user.name}
        </Typography>
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
          <Divider variant="middle" />
          <Grid item xs={12} className={classes.tableCard}>
            <UserDraftTemplates />
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default Home
