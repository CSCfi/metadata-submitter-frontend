import React, { useEffect, useState, useMemo } from "react"

import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import { debounce, shuffle } from "lodash"
import { useTranslation } from "react-i18next"

import SubmissionDataTable from "components/Home/SubmissionDataTable"
import SubmissionTabs from "components/Home/SubmissionTabs"
import WizardSearchBox from "components/SubmissionWizard/WizardComponents/WizardSearchBox"
import { ResponseStatus } from "constants/responseStatus"
import { SubmissionStatus } from "constants/wizardSubmission"
import { setProjectId } from "features/projectIdSlice"
import { updateStatus } from "features/statusMessageSlice"
import { deleteSubmissionAndContent } from "features/wizardSubmissionSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import submissionAPIService from "services/submissionAPI"
import type { SubmissionDetailsWithId, SubmissionRow } from "types"

const FrontPageContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  width: "90%",
  backgroundColor: theme.palette.common.white,
  paddingTop: "8rem !important",
  paddingBottom: "10rem !important",
}))

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const projectId = useAppSelector(state => state.projectId)
  const { t } = useTranslation()

  const [isFetchingSubmissions, setFetchingSubmissions] = useState<boolean>(true)

  // Selected tab value
  const [tabValue, setTabValue] = useState<string>(SubmissionStatus.all)

  // List of all draft and published submissions depending on the selected tab
  const [allSubmissions, setAllSubmissions] = useState<Array<SubmissionDetailsWithId> | []>([])
  const [allDraftSubmissions, setAllDraftSubmissions] = useState<
    Array<SubmissionDetailsWithId> | []
  >([])
  const [allPublishedSubmissions, setAllPublishedSubmissions] = useState<
    Array<SubmissionDetailsWithId> | []
  >([])

  // Filtered submission rows based on filtering text
  const [filteringText, setFilteringText] = useState<string>("")
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    Array<SubmissionDetailsWithId> | []
  >([])

  // Current page of all submission table
  const [allSubmissionsPage, setAllSubmissionsPage] = useState<number>(0)

  // Current page of draft submission table
  const [draftPage, setDraftPage] = useState<number>(0)

  // Current page of published submission table
  const [publishedPage, setPublishedPage] = useState<number>(0)

  // Total number of draft and published submissions
  const [numberOfAllSubmissions, setNumberOfAllSubmissions] = useState<number>(0)
  const [numberOfDraftSubmissions, setNumberOfDraftSubmissions] = useState<number>(0)
  const [numberOfPublishedSubmissions, setNumberOfPublishedSubmissions] = useState<number>(0)

  // Array of tabs to be rendered
  const frontpageTabs = [
    { label: t("allSubmissions"), value: SubmissionStatus.all, testId: "all-tab" },
    { label: t("draftSubmissions"), value: SubmissionStatus.unpublished, testId: "draft-tab" },
    {
      label: t("publishedSubmissions"),
      value: SubmissionStatus.published,
      testId: "published-tab",
    },
  ]
  /*
   *  Set the current projectId as the first one if no projectId has been selected
   */
  useEffect(() => {
    if (user.projects.length > 0) {
      dispatch(setProjectId(user.projects[0].projectId))
    }
  }, [user])

  /*
   *  Get all (draft and published) submissions for the first page in data table
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
          const unpublishedData = unpublishedResponse.data
          const publishedData = publishedResponse.data
          // Set total number of submissions
          setNumberOfDraftSubmissions(unpublishedData.page.totalSubmissions)
          setNumberOfPublishedSubmissions(publishedData.page.totalSubmissions)
          setNumberOfAllSubmissions(
            unpublishedData.page.totalSubmissions + publishedData.page.totalSubmissions
          )
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
   *   Get the list of all (draft and published) submissions
   */
  useEffect(() => {
    setAllSubmissions(
      shuffle(
        (allDraftSubmissions as SubmissionDetailsWithId[]).concat(
          allPublishedSubmissions as SubmissionDetailsWithId[]
        )
      )
    )
  }, [allDraftSubmissions, allPublishedSubmissions])

  /*
   * Cancel the debouncedChangeFilteringText function when the component unmounts
   */
  useEffect(() => {
    return () => {
      debouncedChangeFilteringText.cancel()
    }
  }, [allSubmissions, allDraftSubmissions, allPublishedSubmissions, tabValue])

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
    if (filteringText) getFilter(filteringText, newValue)
  }

  const getDisplayRows = (items: Array<SubmissionDetailsWithId>): Array<SubmissionRow> => {
    return items.map(item => ({
      id: item.submissionId,
      name: item.name,
      dateCreated: item.dateCreated,
      lastModifiedBy: "TBA",
      submissionType: item.published ? SubmissionStatus.published : SubmissionStatus.unpublished,
    }))
  }

  const getCurrentRows = (): Array<SubmissionRow> => {
    const submissions =
      tabValue === SubmissionStatus.all
        ? allSubmissions
        : tabValue === SubmissionStatus.unpublished
          ? allDraftSubmissions
          : allPublishedSubmissions
    const currentSubmissions = filteringText ? filteredSubmissions : submissions
    const currentRows = getDisplayRows(currentSubmissions)
    return currentRows
  }

  const getCurrentTotalItems = () => {
    if (filteringText) return filteredSubmissions.length
    else {
      return tabValue === SubmissionStatus.all
        ? numberOfAllSubmissions
        : tabValue === SubmissionStatus.unpublished
          ? numberOfDraftSubmissions
          : numberOfPublishedSubmissions
    }
  }

  /*
   * Fire when user selects a page
   * or selects previous/next arrows
   * or deletes a submission
   */
  const handleFetchPageOnChange = async (page: number) => {
    tabValue === SubmissionStatus.all
      ? setAllSubmissionsPage(page)
      : tabValue === SubmissionStatus.unpublished
        ? setDraftPage(page)
        : setPublishedPage(page)
  }

  const handleDeleteSubmission = async (submissionId: string, submissionType: string) => {
    // Dispatch action to delete the submission
    try {
      await dispatch(deleteSubmissionAndContent(submissionId))
      dispatch(
        updateStatus({
          status: ResponseStatus.success,
          helperText: "snackbarMessages.success.submissions.deleted",
        })
      )

      if (filteringText) {
        const newFilteredSubmissions = filteredSubmissions.filter(
          item => item.submissionId !== submissionId
        )
        setFilteredSubmissions(newFilteredSubmissions)
      }
    } catch (error) {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: error,
        })
      )
    }

    if (numberOfAllSubmissions > 1) {
      // Fetch again the list of submissions based on submissionType
      const response = await submissionAPIService.getSubmissions({
        page: 1,
        per_page: numberOfDraftSubmissions - 1,
        published: submissionType === SubmissionStatus.unpublished ? false : true,
        projectId,
      })
      const submissions = response.data.submissions

      // Reset submissions and number of submissions
      if (submissionType === SubmissionStatus.unpublished) {
        setAllDraftSubmissions(submissions)
        setNumberOfDraftSubmissions(numberOfDraftSubmissions - 1)
      } else if (submissionType === SubmissionStatus.published) {
        setAllPublishedSubmissions(submissions)
        setNumberOfPublishedSubmissions(numberOfDraftSubmissions - 1)
      }
    }
    setAllSubmissions(prevState => prevState.filter(item => item.submissionId !== submissionId))
    setNumberOfAllSubmissions(numberOfAllSubmissions - 1)
  }

  const getFilter = (textValue: string, currentTab: string) => {
    const submissions =
      currentTab === SubmissionStatus.all
        ? allSubmissions
        : currentTab === SubmissionStatus.unpublished
          ? allDraftSubmissions
          : allPublishedSubmissions
    const filteredSubmissions = submissions.filter(item => item && item.name.includes(textValue))
    setFilteredSubmissions(filteredSubmissions)
  }

  const handleChangeFilteringText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the current page in pagination to 0 when starting the filter
    tabValue === SubmissionStatus.all
      ? setAllSubmissionsPage(0)
      : tabValue === SubmissionStatus.unpublished
        ? setDraftPage(0)
        : setPublishedPage(0)
    const textValue = e.target.value
    setFilteringText(textValue)
    debouncedChangeFilteringText(textValue, tabValue)
  }

  const debouncedChangeFilteringText = useMemo(
    () => debounce(getFilter, 300),
    [allSubmissions, allDraftSubmissions, allPublishedSubmissions, tabValue]
  )

  const handleClearFilteringText = () => {
    // Set the current page in pagination to 0 when clearing the filter
    tabValue === SubmissionStatus.unpublished ? setDraftPage(0) : setPublishedPage(0)
    setFilteringText("")
  }

  // Render either unpublished or published submissions based on selected tab
  return (
    <FrontPageContainer maxWidth={false} disableGutters>
      <Box sx={{ mt: 10 }}>
        <SubmissionTabs
          tabsAriaLabel="draft-and-published-submissions-tabs"
          tabs={frontpageTabs}
          tabValue={tabValue}
          handleChangeTab={handleChangeTab}
        />
      </Box>
      <Paper square elevation={0}>
        <Grid container sx={{ width: "100%" }}>
          <Grid container justifyContent="flex-start" sx={{ m: "3rem 0" }} size={{ xs: 12 }}>
            <WizardSearchBox
              placeholder={t("searchItems")}
              filteringText={filteringText}
              handleChangeFilteringText={handleChangeFilteringText}
              handleClearFilteringText={handleClearFilteringText}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SubmissionDataTable
              submissionType={tabValue}
              page={
                tabValue === SubmissionStatus.all
                  ? allSubmissionsPage
                  : tabValue === SubmissionStatus.unpublished
                    ? draftPage
                    : publishedPage
              }
              totalItems={getCurrentTotalItems()}
              fetchPageOnChange={handleFetchPageOnChange}
              rows={getCurrentRows()}
              onDeleteSubmission={handleDeleteSubmission}
            />
          </Grid>

          {isFetchingSubmissions && (
            <CircularProgress sx={{ m: "10 auto" }} size={50} thickness={2.5} />
          )}
        </Grid>
      </Paper>
    </FrontPageContainer>
  )
}

export default Home
