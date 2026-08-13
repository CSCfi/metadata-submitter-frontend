import React, { useState, useEffect } from "react"

import HomeIcon from "@mui/icons-material/Home"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"

import WizardAlert from "components/SubmissionWizard/WizardComponents/WizardAlert"
import WizardDataBucketTable from "components/SubmissionWizard/WizardComponents/WizardDataBucketTable"
import WizardFilesTable from "components/SubmissionWizard/WizardComponents/WizardFilesTable"
import { ResponseStatus } from "constants/responseStatus"
import { setBuckets, addFiles } from "features/bucketsSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"
import { addBucketToSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import bucketsAPIService from "services/bucketsAPI"
import type { File } from "types"
import { isBucketFile } from "utils"

/*
 * Render buckets and files from SD Connect based on user selection
 */
const WizardDataBucketStep = () => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const projectId = submission.projectId
  const linkedBucket = submission.bucket || ""

  const { t } = useTranslation()

  const schemePrefix = "S3://"

  const [files, setFiles] = useState<File[] | []>([])

  const [alert, setAlert] = useState<boolean>(false)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [currentFilePath, setCurrentFilePath] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedBucket, setSelectedBucket] = useState<string>("")

  /*
   * Fetch selected project related buckets
   */
  useEffect(() => {
    let isMounted = true
    const getBuckets = async () => {
      try {
        const response = await bucketsAPIService.getProjectBuckets(projectId)
        const bucketNames: string[] = response.data
        dispatch(setBuckets(bucketNames))
      } catch (error) {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "",
          })
        )
      }
    }
    if (isMounted) getBuckets()
    setIsLoading(false)
    return () => {
      isMounted = false
    }
  }, [projectId])

  /*
   * Fetch selected bucket's files
   */
  useEffect(() => {
    let mounted = true
    const getFiles = async () => {
      if (!!selectedBucket) {
        try {
          bucketsAPIService.grantAccessBucket(projectId, selectedBucket).then(res => {
            return res.data
          })
          const response = await bucketsAPIService.getBucketFiles(projectId, selectedBucket)
          if (response.status === 400) console.log("ERROR", response)
          else {
            dispatch(addFiles({ bucketName: selectedBucket, files: response.data }))
            setFiles(response.data)
          }
        } catch (err) {
          console.log("CATCHING", err)
        }
      }
    }
    if (mounted) getFiles()
    return () => {
      mounted = false
    }
  }, [selectedBucket])

  const handleAlert = (state: boolean) => {
    if (state) handleLinkBucket()
    setAlert(false)
  }

  const handleLinkBucket = async () => {
    dispatch(resetUnsavedForm())
    dispatch(addBucketToSubmission(submission.submissionId, selectedBucket))
  }

  const handleBucketChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBucket(event.target.value)
    dispatch(setUnsavedForm())
  }

  const handleFilesView = (bucketName: string) => {
    if (!linkedBucket) {
      const currentPath =
        files.length > 0
          ? schemePrefix.concat(
              files
                .filter(file => file.path.split("//")[1].split("/")[0] === bucketName)[0]
                .path.split("//")[1]
                .split("/")
                .slice(0, 1)
                .join("/")
            )
          : selectedBucket
      setCurrentFilePath(currentPath)
      setBreadcrumbs([t("dataBucket.allBuckets"), bucketName])
    }
  }

  const handleAddToBreadcrumbs = (folderName: string) => {
    setBreadcrumbs(prevState => [...prevState, folderName])
  }

  const handleClickBreadcrumb = (breadcrumb: string, index: number) => {
    /* Remove all breadcrumbs if "All buckets" is clicked.
     * Otherwise, remove the following breadcrumbs if one breadcrumb is clicked/selected.
     */
    if (index === 0) setBreadcrumbs([])
    else setBreadcrumbs(breadcrumbs.slice(0, index + 1))

    /* Check if the last element of current filePath equals to selected breadcrumb,
     * if not, replacing current filePath with a new one that ends with the breadcrumb.
     */
    const splitFilePath = currentFilePath.split("/")
    if (breadcrumb && breadcrumb !== splitFilePath[splitFilePath.length - 1]) {
      const breadcrumbIndex = splitFilePath.indexOf(breadcrumb)
      const newFilePath = splitFilePath.slice(0, breadcrumbIndex + 1).join("/")
      setCurrentFilePath(newFilePath)
    }
  }

  const handleClickFileRow = (path: string, name: string) => {
    if (!isBucketFile(files, path)) {
      /* Keep setting new filePath if current filePath's length < original filePath's length.
       * It means that the current file is still nested under folder
       */
      setCurrentFilePath(path)
      handleAddToBreadcrumbs(name)
    }
  }

  const linkBucketButton = (
    <Button
      disabled={!selectedBucket || !!linkedBucket}
      variant="contained"
      aria-label={t("ariaLabels.linkBucket")}
      size="small"
      type="submit"
      onClick={() => setAlert(true)}
      data-testid="link-data-bucket"
    >
      {t("dataBucket.linkBucket")}
    </Button>
  )

  const renderHeading = () => (
    <Typography variant="h5" fontWeight="700" color="secondary">
      {linkedBucket ? t("dataBucket.linkedBucket") : t("dataBucket.linkFromSDConnect")}
    </Typography>
  )

  const renderBreadcrumbs = () =>
    !!breadcrumbs.length && (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="large" />}
        aria-label={t("ariaLabels.folderBreadcrumb")}
        data-testid="folder-breadcrumb"
      >
        {breadcrumbs.map((el, index) => (
          <Link
            key={index}
            underline="none"
            color="primary"
            href="#"
            onClick={() => handleClickBreadcrumb(el, index)}
            data-testid={el}
          >
            {index === 0 && (
              <HomeIcon
                color="primary"
                fontSize="large"
                sx={{ mr: "0.5rem", verticalAlign: "middle" }}
              />
            )}
            {index === 0 ? t("dataBucket.allBuckets") : el}
          </Link>
        ))}
      </Breadcrumbs>
    )

  const renderBucketTable = () =>
    !breadcrumbs.length && (
      <WizardDataBucketTable
        selectedBucket={selectedBucket}
        linkedBucket={linkedBucket}
        handleBucketChange={handleBucketChange}
        handleFilesView={handleFilesView}
      />
    )

  const renderFileTable = () =>
    !!breadcrumbs.length && (
      <WizardFilesTable
        currentFilePath={currentFilePath}
        files={files}
        handleClickFileRow={handleClickFileRow}
      />
    )

  if (isLoading) return <CircularProgress />

  return (
    <Box>
      <WizardStepContentHeader action={linkBucketButton} />
      <Box display="flex" flexDirection="column" p="5rem" gap={4}>
        {renderHeading()}
        {renderBreadcrumbs()}
        {renderBucketTable()}
        {renderFileTable()}
      </Box>
      {alert && <WizardAlert onAlert={handleAlert} parentLocation="submission" alertType="link" />}
    </Box>
  )
}

export default WizardDataBucketStep
