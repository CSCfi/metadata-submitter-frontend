//@flow
import React, { useEffect, useState } from "react"

import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, Link as RouterLink } from "react-router-dom"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setTotalFolders } from "features/totalFoldersSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import folderAPIService from "services/folderAPI"
import { pathWithLocale } from "utils"

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
  const totalFolders = useSelector(state => state.totalFolders)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)

  const location = useLocation().pathname.split("/").pop()

  const [page, setPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      // Fetch either unpublishedFolders OR publishedFolders again if they are not fetched in Home
      if (unpublishedFolders === null || publishedFolders === null) {
        const response = await folderAPIService.getFolders({
          page: 1,
          per_page: 10,
          published: location === "drafts" ? false : true,
        })

        if (isMounted) {
          if (response.ok) {
            location === "drafts"
              ? dispatch(setUnpublishedFolders(response.data.folders))
              : dispatch(setPublishedFolders(response.data.folders))
            location === "drafts"
              ? dispatch(setTotalFolders({ ...totalFolders, totalUnpublishedFolders: response.data.page.totalFolders }))
              : setTotalFolders({ ...totalFolders, totalPublishedFolders: response.data.page.totalFolders })
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
      setFetchingFolders(false)
    }
    getFolders()
    return () => {
      isMounted = false
    }
  }, [])

  // Fire when user selects an option from "Items per page"
  const handleFetchItemsPerPage = async (numberOfItems: number): any => {
    const response = await folderAPIService.getFolders({
      page: 1,
      per_page: numberOfItems,
      published: location === "drafts" ? false : true,
    })
    setPage(0)

    if (response.ok) {
      location === "drafts"
        ? dispatch(setUnpublishedFolders(response.data.folders))
        : dispatch(setPublishedFolders(response.data.folders))
      setItemsPerPage(numberOfItems)
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

  // Fire when user selects previous/next arrows
  const handleFetchPageOnChange = async (page: number): any => {
    const response = await folderAPIService.getFolders({
      page: page + 1,
      per_page: itemsPerPage,
      published: location === "drafts" ? false : true,
    })
    if (response.ok) {
      location === "drafts"
        ? dispatch(setUnpublishedFolders(response.data.folders))
        : dispatch(setPublishedFolders(response.data.folders))
      setPage(page)
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

  // Full list of folders
  const Submissions = () => (
    <Grid item xs={12} className={classes.tableCard}>
      <SubmissionIndexCard
        folderType={location === "drafts" ? FolderSubmissionStatus.unpublished : FolderSubmissionStatus.published}
        folders={location === "drafts" ? unpublishedFolders : publishedFolders}
        location={location}
        page={page}
        itemsPerPage={itemsPerPage}
        totalItems={location === "drafts" ? totalFolders.totalUnpublishedFolders : totalFolders.totalPublishedFolders}
        fetchItemsPerPage={handleFetchItemsPerPage}
        fetchPageOnChange={handleFetchPageOnChange}
      />
    </Grid>
  )

  return (
    <Grid
      className={classes.folderGrid}
      container
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
    >
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" component={RouterLink} to={pathWithLocale("home")}>
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
    </Grid>
  )
}

export default SubmissionFolderList
