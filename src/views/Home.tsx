import React, { useEffect, useState } from "react"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import { Link as RouterLink } from "react-router-dom"

import SubmissionIndexCard from "components/Home/SubmissionIndexCard"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setTotalFolders } from "features/totalFoldersSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import folderAPIService from "services/folderAPI"
import { pathWithLocale } from "utils"

const FrontPageContainer = styled(Container)(() => ({
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
}))

const FrontPageTabs = styled(Tabs)(() => ({
  ["& .MuiTabs-indicator"]: {
    height: "0.375em",
    borderRadius: "0.375em 0.375em 0 0",
  },
}))

const FrontPageTab = styled(Tab)(({ theme }) => ({
  ["&.MuiButtonBase-root.MuiTab-root"]: {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}))

const CreateSubmissionButton = styled(Button)(() => ({
  height: "6.5vh",
  width: "10.5vw",
  position: "absolute",
  right: 0,
  bottom: "2vh",
}))

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const unpublishedFolders = useAppSelector(state => state.unpublishedFolders)
  const publishedFolders = useAppSelector(state => state.publishedFolders)

  const totalFolders = useAppSelector(state => state.totalFolders)

  const [isFetchingFolders, setFetchingFolders] = useState(true)

  const [draftPage, setDraftPage] = useState(0)
  const [draftItemsPerPage, setDraftItemsPerPage] = useState(10)

  const [publishedPage, setPublishedPage] = useState(0)
  const [publishedItemsPerPage, setPublishedItemsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [dispatch])

  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      const unpublishedResponse = await folderAPIService.getFolders({
        page: 1,
        per_page: 10,
        published: false,
      })
      const publishedResponse = await folderAPIService.getFolders({ page: 1, per_page: 10, published: true })

      if (isMounted) {
        if (unpublishedResponse.ok && publishedResponse.ok) {
          dispatch(setUnpublishedFolders(unpublishedResponse.data?.folders))
          dispatch(setPublishedFolders(publishedResponse.data.folders))
          dispatch(
            setTotalFolders({
              totalUnpublishedFolders: unpublishedResponse.data.page?.totalFolders,
              totalPublishedFolders: publishedResponse.data.page?.totalFolders,
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
  }, [dispatch])

  const resetWizard = () => {
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  // Fire when user selects an option from "Items per page"
  const handleFetchItemsPerPage = async (numberOfItems: number, folderType: string) => {
    const response = await folderAPIService.getFolders({
      page: 1,
      per_page: numberOfItems,
      published: folderType === FolderSubmissionStatus.unpublished ? false : true,
    })
    folderType === FolderSubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)

    if (response.ok) {
      folderType === FolderSubmissionStatus.unpublished
        ? dispatch(setUnpublishedFolders(response.data.folders))
        : dispatch(setPublishedFolders(response.data.folders))
      folderType === FolderSubmissionStatus.unpublished
        ? setDraftItemsPerPage(numberOfItems)
        : setPublishedItemsPerPage(numberOfItems)
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
  const handleFetchPageOnChange = async (page: number, folderType: string) => {
    const response = await folderAPIService.getFolders({
      page: page + 1,
      per_page: folderType === FolderSubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage,
      published: folderType === FolderSubmissionStatus.unpublished ? false : true,
    })
    if (response.ok) {
      folderType === FolderSubmissionStatus.unpublished
        ? dispatch(setUnpublishedFolders(response.data.folders))
        : dispatch(setPublishedFolders(response.data.folders))
      folderType === FolderSubmissionStatus.unpublished ? setDraftPage(page) : setPublishedPage(page)
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

  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  // Contains both unpublished and published folders (max. 5 items/each)
  return (
    <FrontPageContainer>
      <Typography variant="h4" sx={{ color: "secondary.main", fontWeight: 700, mt: "6vh" }}>
        My submissions
      </Typography>
      <Box sx={{ mt: "6vh", position: "relative" }}>
        <FrontPageTabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          textColor="primary"
          indicatorColor="primary"
        >
          <FrontPageTab label="Drafts" value={0} sx={{ fontWeight: 500, fontSize: "1em" }} />
          <FrontPageTab label="Published" value={1} sx={{ fontWeight: 500, fontSize: "1em" }} />
        </FrontPageTabs>
        <Link component={RouterLink} aria-label="Create Submission" to={pathWithLocale("newdraft?step=0")}>
          <CreateSubmissionButton
            color="primary"
            variant="contained"
            onClick={() => {
              resetWizard()
            }}
            data-testid="link-create-submission"
          >
            Create Submission
          </CreateSubmissionButton>
        </Link>
      </Box>

      <Paper square sx={{ padding: "2em" }}>
        <Grid container>
          {value === 0 && (
            <Grid item xs={12}>
              <SubmissionIndexCard
                folderType={FolderSubmissionStatus.unpublished}
                folders={unpublishedFolders}
                location="drafts"
                page={draftPage}
                itemsPerPage={draftItemsPerPage}
                totalItems={totalFolders.totalUnpublishedFolders}
                fetchItemsPerPage={handleFetchItemsPerPage}
                fetchPageOnChange={handleFetchPageOnChange}
              />
            </Grid>
          )}
          {value === 1 && (
            <Grid item xs={12}>
              <SubmissionIndexCard
                folderType={FolderSubmissionStatus.published}
                folders={publishedFolders}
                location="published"
                page={publishedPage}
                itemsPerPage={publishedItemsPerPage}
                totalItems={totalFolders.totalPublishedFolders}
                fetchItemsPerPage={handleFetchItemsPerPage}
                fetchPageOnChange={handleFetchPageOnChange}
              />
            </Grid>
          )}

          {isFetchingFolders && <CircularProgress sx={{ m: "10 auto" }} size={50} thickness={2.5} />}
        </Grid>
      </Paper>
    </FrontPageContainer>
  )
}

export default Home
