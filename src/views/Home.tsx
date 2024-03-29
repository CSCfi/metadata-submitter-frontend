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
import WizardSearchBox from "components/SubmissionWizard/WizardComponents/WizardSearchBox"
import { ResponseStatus } from "constants/responseStatus"
import { SubmissionStatus } from "constants/wizardSubmission"
import { setProjectId } from "features/projectIdSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { deleteSubmissionAndContent, resetSubmission } from "features/wizardSubmissionSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import submissionAPIService from "services/submissionAPI"
import type { SubmissionDetailsWithId, SubmissionRow } from "types"
import { pathWithLocale } from "utils"

const ProjectDropdown = styled(FormControl)(({ theme }) => ({
  marginTop: "1rem",
  marginBottom: "2rem",
  "& .MuiOutlinedInput-root": {
    width: "40rem",
    height: "4rem",
    backgroundColor: theme.palette.common.white,
    color: theme.palette.secondary.main,
    border: `0.15rem solid ${theme.palette.secondary.main}`,
    borderRadius: "0.375rem",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& svg": { fontSize: "2rem" },
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

const getDisplayRows = (items: Array<SubmissionDetailsWithId>): Array<SubmissionRow> => {
  return items.map(item => ({
    id: item.submissionId,
    name: item.name,
    dateCreated: item.dateCreated,
    lastModifiedBy: "TBA",
  }))
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const projectId = useAppSelector(state => state.projectId)
  const [isFetchingSubmissions, setFetchingSubmissions] = useState<boolean>(true)

  // Selected tab value
  const [tabValue, setTabValue] = useState<string>(SubmissionStatus.unpublished)

  // Current submissions to be displayed in the data table
  const [displaySubmissions, setDisplaySubmissions] = useState<Array<SubmissionDetailsWithId> | []>([])

  // List of all draft and published submissions depending on the selected tab
  const [allDraftSubmissions, setAllDraftSubmissions] = useState<Array<SubmissionDetailsWithId> | []>([])
  const [allPublishedSubmissions, setAllPublishedSubmissions] = useState<Array<SubmissionDetailsWithId> | []>([])

  // Filtered submission rows based on filtering text
  const [filteringText, setFilteringText] = useState<string>("")
  const [filteredSubmissions, setFilteredSubmissions] = useState<Array<SubmissionDetailsWithId> | []>([])

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
    const getSubmissions = async () => {
      const unpublishedResponse = await submissionAPIService.getSubmissions({
        page: 1,
        per_page: 5,
        published: false,
        projectId: projectId,
      })

      const publishedResponse = await submissionAPIService.getSubmissions({
        page: 1,
        per_page: 5,
        published: true,
        projectId: projectId,
      })

      if (isMounted) {
        if (unpublishedResponse.ok && publishedResponse.ok) {
          // Set submissions to be displayed based on tabValue
          const displaySubmissions =
            tabValue === SubmissionStatus.unpublished
              ? unpublishedResponse.data?.submissions
              : publishedResponse.data?.submissions

          setDisplaySubmissions(displaySubmissions)

          // Set total number of submissions
          setNumberOfDraftSubmissions(unpublishedResponse.data.page?.totalSubmissions)
          setNumberOfPublishedSubmissions(publishedResponse.data.page?.totalSubmissions)

          setFetchingSubmissions(false)
        } else {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: !unpublishedResponse.ok ? unpublishedResponse : publishedResponse,
              helperText: "Fetching submissions error.",
            })
          )
        }
      }
    }
    if (projectId) getSubmissions()
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
          const unpublishedResponse = await submissionAPIService.getSubmissions({
            page: 1,
            per_page: numberOfDraftSubmissions,
            published: false,
            projectId,
          })
          setAllDraftSubmissions(unpublishedResponse.data?.submissions)
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
          const publishedResponse = await submissionAPIService.getSubmissions({
            page: 1,
            per_page: numberOfPublishedSubmissions,
            published: true,
            projectId,
          })
          setAllPublishedSubmissions(publishedResponse.data?.submissions)
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
    dispatch(resetSubmission())
  }

  const handleProjectIdChange = (event: SelectChangeEvent) => {
    dispatch(setProjectId(event.target.value))
  }

  const projectSelection = (
    <ProjectDropdown color="secondary" data-testid="project-id-selection">
      <Select
        value={projectId ? projectId : ""}
        onChange={handleProjectIdChange}
        inputProps={{ "aria-label": "Select project id" }}
      >
        {user.projects.map(project => (
          <MenuItem key={project.projectId} value={project.projectId} sx={{ color: "secondary.main", p: "1rem" }}>
            {`Project_${project.projectNumber}`}
          </MenuItem>
        ))}
      </Select>
    </ProjectDropdown>
  )

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
    if (filteringText) getFilter(filteringText, newValue)
  }

  const getCurrentRows = (): Array<SubmissionRow> => {
    const displaySubmissionRows = getDisplayRows(displaySubmissions)
    const filteredSubmissionRows = getDisplayRows(filteredSubmissions)
    // Show filteredRows based on tabValue
    const displayFilteredSubmissionRows =
      tabValue === SubmissionStatus.unpublished
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
      return tabValue === SubmissionStatus.unpublished ? numberOfDraftSubmissions : numberOfPublishedSubmissions
    }
  }

  /*
   *  Fire when user selects an option from "Items per page"
   */
  const handleFetchItemsPerPage = async (numberOfItems: number, submissionType: string) => {
    const response = await submissionAPIService.getSubmissions({
      page: 1,
      per_page: numberOfItems,
      published: submissionType === SubmissionStatus.unpublished ? false : true,
      projectId,
    })

    if (response.ok) {
      // Set new display submissions
      const displaySubmissions = response.data?.submissions
      setDisplaySubmissions(displaySubmissions)

      if (submissionType === SubmissionStatus.unpublished) {
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
          helperText: "Fetching submissions error.",
        })
      )
    }
  }

  /*
   * Fire when user selects a page
   * or selects previous/next arrows
   * or deletes a submission
   */
  const handleFetchPageOnChange = async (page: number, submissionType: string, isDeletingSubmission?: boolean) => {
    submissionType === SubmissionStatus.unpublished ? setDraftPage(page) : setPublishedPage(page)

    // Fetch new page
    const response = await submissionAPIService.getSubmissions({
      page: page + 1,
      per_page: submissionType === SubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage,
      published: submissionType === SubmissionStatus.unpublished ? false : true,
      projectId,
    })

    if (response.ok) {
      // Set new display submissions
      const displaySubmissions = response.data?.submissions
      setDisplaySubmissions(displaySubmissions)

      // Only set again a new total number of submissions if a submission is deleted
      if (isDeletingSubmission) {
        submissionType === SubmissionStatus.unpublished
          ? setNumberOfDraftSubmissions(response.data.page?.totalSubmissions)
          : setNumberOfPublishedSubmissions(response.data.page?.totalSubmissions)
      }
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Fetching submissions error.",
        })
      )
    }
  }

  const handleDeleteSubmission = (submissionId: string, submissionType: string) => {
    // Dispatch action to delete the submission
    dispatch(deleteSubmissionAndContent(submissionId))
      .then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "The submission has been deleted successfully!",
          })
        )
        // Then fetch current page again to get new list of display submissions and a new total number of submissions
        handleFetchPageOnChange(
          submissionType === SubmissionStatus.unpublished ? draftPage : publishedPage,
          submissionType,
          true
        )
        // If there is a filtering text, get a new filtered list of submissions again
        if (filteringText) {
          const newFilteredSubmissions = filteredSubmissions.filter(item => item.submissionId !== submissionId)
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
      currentTab === SubmissionStatus.unpublished ? allDraftSubmissions : allPublishedSubmissions

    const filteredSubmissions = allSubmissions.filter(item => item && item.name.includes(textValue))
    setFilteredSubmissions(filteredSubmissions)
  }

  const handleChangeFilteringText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the current page in pagination to 0 when starting the filter
    tabValue === SubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)
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
    tabValue === SubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)
    setFilteringText("")
  }

  // Render either unpublished or published submissions based on selected tab
  return (
    <FrontPageContainer maxWidth={false}>
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
          <FrontPageTab label="Drafts" value={SubmissionStatus.unpublished} data-testid="drafts-tab" />
          <FrontPageTab label="Published" value={SubmissionStatus.published} data-testid="published-tab" />
        </FrontPageTabs>
        <Link component={RouterLink} aria-label="Create submission" to={pathWithLocale("submission?step=1")}>
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
                submissionType={
                  tabValue === SubmissionStatus.unpublished
                    ? SubmissionStatus.unpublished
                    : SubmissionStatus.published
                }
                page={tabValue === SubmissionStatus.unpublished ? draftPage : publishedPage}
                itemsPerPage={
                  tabValue === SubmissionStatus.unpublished ? draftItemsPerPage : publishedItemsPerPage
                }
                totalItems={getCurrentTotalItems()}
                fetchItemsPerPage={handleFetchItemsPerPage}
                fetchPageOnChange={handleFetchPageOnChange}
                rows={getCurrentRows()}
                onDeleteSubmission={handleDeleteSubmission}
              />
            </Grid>

            {isFetchingSubmissions && <CircularProgress sx={{ m: "10 auto" }} size={50} thickness={2.5} />}
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
