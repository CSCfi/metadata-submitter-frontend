import React, { useEffect, useState, useMemo } from "react"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { styled } from "@mui/material/styles"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import { debounce } from "lodash"
import { Link as RouterLink } from "react-router-dom"

import SubmissionDataTable from "components/Home/SubmissionDataTable"
import WizardSearchBox from "components/NewDraftWizard/WizardComponents/WizardSearchBox"
import { ResponseStatus } from "constants/responseStatus"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setProjectId } from "features/projectSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { deleteFolderAndContent, resetFolder } from "features/wizardSubmissionFolderSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import folderAPIService from "services/folderAPI"
import type { FolderDetailsWithId, FolderRow } from "types"
import { pathWithLocale } from "utils"

const ProjectDropdown = styled(FormControl)(({ theme }) => ({
  width: "40rem",
  height: "4rem",
  marginTop: "1rem",
  marginBottom: "2rem",
  borderRadius: "0.375rem",

  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.secondary.main,
    border: `0.1rem solid #757575`,
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
}))

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

const getDisplayRows = (items: Array<FolderDetailsWithId>): Array<FolderRow> => {
  return items.map(item => ({
    id: item.folderId,
    name: item.name,
    dateCreated: item.dateCreated,
    lastModifiedBy: "TBA",
    cscProject: "TBA",
  }))
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const projectId = useAppSelector(state => state.projectId)

  const [isFetchingFolders, setFetchingFolders] = useState<boolean>(true)

  // Selected tab value
  const [tabValue, setTabValue] = useState<string>(FolderSubmissionStatus.unpublished)

  // Current submissions to be displayed in the data table
  const [displaySubmissions, setDisplaySubmissions] = useState<Array<FolderDetailsWithId> | []>([])

  // List of all draft and published submissions depending on the selected tab
  const [allDraftSubmissions, setAllDraftSubmissions] = useState<Array<FolderDetailsWithId> | []>([])
  const [allPublishedSubmissions, setAllPublishedSubmissions] = useState<Array<FolderDetailsWithId> | []>([])

  // Filtered submission rows based on filtering text
  const [filteringText, setFilteringText] = useState<string>("")
  const [filteredSubmissions, setFilteredSubmissions] = useState<Array<FolderDetailsWithId> | []>([])

  // Current page of draft submission table
  const [draftPage, setDraftPage] = useState<number>(0)
  const [draftItemsPerPage, setDraftItemsPerPage] = useState<number>(5)

  // Current page of published submission table
  const [publishedPage, setPublishedPage] = useState<number>(0)
  const [publishedItemsPerPage, setPublishedItemsPerPage] = useState<number>(5)

  // Total number of draft and published submissions
  const [numberOfDraftSubmissions, setNumberOfDraftSubmissions] = useState<number>(0)
  const [numberOfPublishedSubmissions, setNumberOfPublishedSubmissions] = useState<number>(0)

  /*
   *  Set the current projectId as the first one if no projectId has been selected
   */
  useEffect(() => {
    if (user.projects.length > 0) {
      dispatch(setProjectId(user.projects[0].projectId))
    }
  }, [user])

  /*
   *  Get draft and published submissions for the first page in data table
   */
  useEffect(() => {
    let isMounted = true
    const getFolders = async () => {
      const unpublishedResponse = await folderAPIService.getFolders({
        page: 1,
        per_page: 5,
        published: false,
        projectId: projectId,
      })

      const publishedResponse = await folderAPIService.getFolders({
        page: 1,
        per_page: 5,
        published: true,
        projectId: projectId,
      })

      if (isMounted) {
        if (unpublishedResponse.ok && publishedResponse.ok) {
          // Set submissions to be displayed based on tabValue
          const displaySubmissions =
            tabValue === FolderSubmissionStatus.unpublished
              ? unpublishedResponse.data?.folders
              : publishedResponse.data?.folders

          setDisplaySubmissions(displaySubmissions)

          // Set total number of submissions
          setNumberOfDraftSubmissions(unpublishedResponse.data.page?.totalFolders)
          setNumberOfPublishedSubmissions(publishedResponse.data.page?.totalFolders)

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
    if (projectId) getFolders()
    return () => {
      isMounted = false
    }
  }, [dispatch, tabValue, projectId])

  /*
   *  Get the list of all draft submissions
   */
  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      const getAllDraftSubmisisons = async () => {
        if (numberOfDraftSubmissions > 0) {
          const unpublishedResponse = await folderAPIService.getFolders({
            page: 1,
            per_page: numberOfDraftSubmissions,
            published: false,
            projectId,
          })
          setAllDraftSubmissions(unpublishedResponse.data?.folders)
        }
      }
      getAllDraftSubmisisons()
    }
    return () => {
      isMounted = false
    }
  }, [numberOfDraftSubmissions])

  /*
   *   Get the list of all published submissions
   */
  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      const getAllPublishedSubmisisons = async () => {
        if (numberOfPublishedSubmissions > 0) {
          const publishedResponse = await folderAPIService.getFolders({
            page: 1,
            per_page: numberOfPublishedSubmissions,
            published: true,
            projectId,
          })
          setAllPublishedSubmissions(publishedResponse.data?.folders)
        }
      }
      getAllPublishedSubmisisons()
    }
    return () => {
      isMounted = false
    }
  }, [numberOfPublishedSubmissions])

  /*
   * Cancel the debouncedChangeFilteringText function when the component unmounts
   */
  useEffect(() => {
    return () => {
      debouncedChangeFilteringText.cancel()
    }
  }, [allDraftSubmissions, allPublishedSubmissions, tabValue])

  const resetWizard = () => {
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handleChange = (event: SelectChangeEvent) => {
    dispatch(setProjectId(event.target.value))
  }

  const projectSelection = (
    <ProjectDropdown color="secondary">
      <Select
        value={user.projects.length > 0 ? projectId : ""}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Select project id" }}
      >
        {user.projects.map(project => (
          <MenuItem key={project.projectId} value={project.projectId} sx={{ color: "secondary.main" }}>
            {project.projectId}
          </MenuItem>
        ))}
      </Select>
    </ProjectDropdown>
  )

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
    if (filteringText) getFilter(filteringText, newValue)
  }

  const getCurrentRows = (): Array<FolderRow> => {
    const displaySubmissionRows = getDisplayRows(displaySubmissions)
    const filteredSubmissionRows = getDisplayRows(filteredSubmissions)
    // Show filteredRows based on tabValue
    const displayFilteredSubmissionRows =
      tabValue === FolderSubmissionStatus.unpublished
        ? filteredSubmissionRows.slice(draftPage * draftItemsPerPage, draftPage * draftItemsPerPage + draftItemsPerPage)
        : filteredSubmissionRows.slice(
            publishedPage * publishedItemsPerPage,
            publishedPage * publishedItemsPerPage + publishedItemsPerPage
          )
    return filteringText ? displayFilteredSubmissionRows : displaySubmissionRows
  }

  const getCurrentTotalItems = () => {
    if (filteringText) return filteredSubmissions.length
    else {
      return tabValue === FolderSubmissionStatus.unpublished ? numberOfDraftSubmissions : numberOfPublishedSubmissions
    }
  }

  /*
   *  Fire when user selects an option from "Items per page"
   */
  const handleFetchItemsPerPage = async (numberOfItems: number, folderType: string) => {
    const response = await folderAPIService.getFolders({
      page: 1,
      per_page: numberOfItems,
      published: folderType === FolderSubmissionStatus.unpublished ? false : true,
      projectId,
    })

    if (response.ok) {
      // Set new display submissions
      const displaySubmissions = response.data?.folders
      setDisplaySubmissions(displaySubmissions)

      if (folderType === FolderSubmissionStatus.unpublished) {
        setDraftPage(0)
        setDraftItemsPerPage(numberOfItems)
      } else {
        setPublishedPage(0)
        setPublishedItemsPerPage(numberOfItems)
      }
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

  /*
   * Fire when user selects a page
   * or selects previous/next arrows
   * or deletes a submission
   */
  const handleFetchPageOnChange = async (page: number, folderType: string, isDeletingSubmission?: boolean) => {
    folderType === FolderSubmissionStatus.unpublished ? setDraftPage(page) : setPublishedPage(page)

    // Fetch new page
    const response = await folderAPIService.getFolders({
      page: page + 1,
      per_page: folderType === FolderSubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage,
      published: folderType === FolderSubmissionStatus.unpublished ? false : true,
      projectId,
    })

    if (response.ok) {
      // Set new display submissions
      const displaySubmissions = response.data?.folders
      setDisplaySubmissions(displaySubmissions)

      // Only set again a new total number of submissions if a submission is deleted
      if (isDeletingSubmission) {
        folderType === FolderSubmissionStatus.unpublished
          ? setNumberOfDraftSubmissions(response.data.page?.totalFolders)
          : setNumberOfPublishedSubmissions(response.data.page?.totalFolders)
      }
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

  const handleDeleteSubmission = (submissionId: string, folderType: string) => {
    // Dispatch action to delete the submission
    dispatch(deleteFolderAndContent(submissionId))
      .then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "The submission has been deleted successfully!",
          })
        )
        // Then fetch current page again to get new list of display submissions and a new total number of submissions
        handleFetchPageOnChange(
          folderType === FolderSubmissionStatus.unpublished ? draftPage : publishedPage,
          folderType,
          true
        )
        // If there is a filtering text, get a new filtered list of submissions again
        if (filteringText) {
          const newFilteredSubmissions = filteredSubmissions.filter(item => item.folderId !== submissionId)
          setFilteredSubmissions(newFilteredSubmissions)
        }
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

  const getFilter = (textValue: string, currentTab: string) => {
    const allSubmissions =
      currentTab === FolderSubmissionStatus.unpublished ? allDraftSubmissions : allPublishedSubmissions

    const filteredSubmissions = allSubmissions.filter(item => item && item.name.includes(textValue))
    setFilteredSubmissions(filteredSubmissions)
  }

  const handleChangeFilteringText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the current page in pagination to 0 when starting the filter
    tabValue === FolderSubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)
    const textValue = e.target.value
    setFilteringText(textValue)
    debouncedChangeFilteringText(textValue, tabValue)
  }

  const debouncedChangeFilteringText = useMemo(
    () => debounce(getFilter, 300),
    [allDraftSubmissions, allPublishedSubmissions, tabValue]
  )

  const handleClearFilteringText = () => {
    // Set the current page in pagination to 0 when clearing the filter
    tabValue === FolderSubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)
    setFilteringText("")
  }

  // Render either unpublished or published folders based on selected tab
  return (
    <FrontPageContainer disableGutters maxWidth={false}>
      <Typography variant="h4" sx={{ color: "secondary.main", fontWeight: 700, mt: 12 }}>
        My submissions
      </Typography>
      {projectSelection}
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
        {displaySubmissions.length > 0 ? (
          <Grid container>
            <Grid container item xs={12} justifyContent="flex-end">
              <WizardSearchBox
                placeholder={"Filter by Name"}
                filteringText={filteringText}
                handleChangeFilteringText={handleChangeFilteringText}
                handleClearFilteringText={handleClearFilteringText}
              />
            </Grid>
            <Grid item xs={12}>
              <SubmissionDataTable
                folderType={
                  tabValue === FolderSubmissionStatus.unpublished
                    ? FolderSubmissionStatus.unpublished
                    : FolderSubmissionStatus.published
                }
                page={tabValue === FolderSubmissionStatus.unpublished ? draftPage : publishedPage}
                itemsPerPage={
                  tabValue === FolderSubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage
                }
                totalItems={getCurrentTotalItems()}
                fetchItemsPerPage={handleFetchItemsPerPage}
                fetchPageOnChange={handleFetchPageOnChange}
                rows={getCurrentRows()}
                onDeleteSubmission={handleDeleteSubmission}
              />
            </Grid>

            {isFetchingFolders && <CircularProgress sx={{ m: "10 auto" }} size={50} thickness={2.5} />}
          </Grid>
        ) : (
          <Grid container>
            <Typography align="center" variant="body1">
              Currently there are no submissions
            </Typography>
          </Grid>
        )}
      </Paper>
    </FrontPageContainer>
  )
}

export default Home
