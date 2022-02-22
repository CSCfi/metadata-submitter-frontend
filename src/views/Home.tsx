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

import SubmissionDataTable from "components/Home/SubmissionDataTable"
import WizardSearchBox from "components/NewDraftWizard/WizardComponents/WizardSearchBox"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { deleteFolderAndContent, resetFolder } from "features/wizardSubmissionFolderSlice"
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
    height: "0.6rem",
    borderRadius: "0.375rem 0.375rem 0 0",
  },
}))

const FrontPageTab = styled(Tab)(({ theme }) => ({
  ["&.MuiButtonBase-root.MuiTab-root"]: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "1.6rem",
  },
}))

const CreateSubmissionButton = styled(Button)(() => ({
  height: "5rem",
  width: "18rem",
  position: "absolute",
  right: 0,
  bottom: "2rem",
}))

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const unpublishedFolders = useAppSelector(state => state.unpublishedFolders)
  const publishedFolders = useAppSelector(state => state.publishedFolders)

  const [isFetchingFolders, setFetchingFolders] = useState(true)

  const [totalDraftSubmissions, setTotalDraftSubmissions] = useState(0)
  const [totalPublishedSubmissions, setTotalPublishedSubmissions] = useState(0)

  const [draftPage, setDraftPage] = useState(0)
  const [draftItemsPerPage, setDraftItemsPerPage] = useState(5)

  const [publishedPage, setPublishedPage] = useState(0)
  const [publishedItemsPerPage, setPublishedItemsPerPage] = useState(5)

  const [tabValue, setTabValue] = React.useState(FolderSubmissionStatus.unpublished)

  // Show folders based on tabValue and convert folders to folderRows for rendering data grid
  const displayFolders = tabValue === FolderSubmissionStatus.unpublished ? unpublishedFolders : publishedFolders

  const folderRows = displayFolders.map(item => ({
    id: item.folderId,
    name: item.name,
    dateCreated: item.dateCreated,
    lastModifiedBy: "TBA",
    cscProject: "TBA",
  }))

  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      const unpublishedResponse = await folderAPIService.getFolders({
        page: 1,
        per_page: 5,
        published: false,
      })

      const publishedResponse = await folderAPIService.getFolders({ page: 1, per_page: 5, published: true })

      if (isMounted) {
        if (unpublishedResponse.ok && publishedResponse.ok) {
          dispatch(setUnpublishedFolders(unpublishedResponse.data?.folders))
          dispatch(setPublishedFolders(publishedResponse.data.folders))

          setTotalDraftSubmissions(unpublishedResponse.data.page?.totalFolders)
          setTotalPublishedSubmissions(publishedResponse.data.page?.totalFolders)

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

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
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

  // Fire when user selects a page
  // or selects previous/next arrows
  // or deletes a submission
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
      folderType === FolderSubmissionStatus.unpublished
        ? setTotalDraftSubmissions(response.data.page?.totalFolders)
        : setTotalPublishedSubmissions(response.data.page?.totalFolders)
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

  const handleDeleteSubmission = (submissionId: string, submissionType: string) => {
    dispatch(deleteFolderAndContent(submissionId))
      .then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "The submission has been deleted successfully!",
          })
        )
        handleFetchPageOnChange(
          submissionType === FolderSubmissionStatus.unpublished ? draftPage : publishedPage,
          submissionType
        )
      })
      .catch(error => {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
          })
        )
      })
  }

  // Render either unpublished or published folders based on selected tab
  return (
    <FrontPageContainer disableGutters maxWidth={false}>
      <Typography variant="h4" sx={{ color: "secondary.main", fontWeight: 700, mt: 12 }}>
        My submissions
      </Typography>
      <Box sx={{ mt: 4, position: "relative" }}>
        <FrontPageTabs
          value={tabValue}
          onChange={handleChangeTab}
          aria-label="draft-and-published-submissions-tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <FrontPageTab label="Drafts" value={FolderSubmissionStatus.unpublished} data-testid="drafts-tab" />
          <FrontPageTab label="Published" value={FolderSubmissionStatus.published} data-testid="published-tab" />
        </FrontPageTabs>
        <Link component={RouterLink} aria-label="Create submission" to={pathWithLocale("newdraft?step=0")}>
          <CreateSubmissionButton
            color="primary"
            variant="contained"
            onClick={() => {
              resetWizard()
            }}
            data-testid="link-create-submission"
          >
            Create submission
          </CreateSubmissionButton>
        </Link>
      </Box>
      <Paper square sx={{ padding: "2rem" }}>
        <Grid container>
          {folderRows.length > 0 && (
            <Grid container item xs={12} justifyContent="flex-end">
              <WizardSearchBox
                placeholder={"Filter by Name"}
                handleSearchTextChange={() => {
                  return
                }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <SubmissionDataTable
              folderType={
                tabValue === FolderSubmissionStatus.unpublished
                  ? FolderSubmissionStatus.unpublished
                  : FolderSubmissionStatus.published
              }
              page={tabValue === FolderSubmissionStatus.unpublished ? draftPage : publishedPage}
              itemsPerPage={tabValue === FolderSubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage}
              totalItems={
                tabValue === FolderSubmissionStatus.unpublished ? totalDraftSubmissions : totalPublishedSubmissions
              }
              fetchItemsPerPage={handleFetchItemsPerPage}
              fetchPageOnChange={handleFetchPageOnChange}
              rows={folderRows}
              onDeleteSubmission={handleDeleteSubmission}
            />
          </Grid>

          {isFetchingFolders && <CircularProgress sx={{ m: "10 auto" }} size={50} thickness={2.5} />}
        </Grid>
      </Paper>
    </FrontPageContainer>
  )
}

export default Home
