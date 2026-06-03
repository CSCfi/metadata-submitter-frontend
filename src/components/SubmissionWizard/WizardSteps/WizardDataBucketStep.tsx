import React, { useState, useEffect } from "react"

import HomeIcon from "@mui/icons-material/Home"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { upperFirst } from "lodash"
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
import type { Bucket, File } from "types"
import { isFile } from "utils"

/*
 * Render buckets and files from SD Connect based on user selection
 */
const WizardDataBucketStep = () => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const projectId = useAppSelector(state => state.projectId)
  const buckets: Bucket[] = useAppSelector(state => state.buckets)
  const linkedBucket = submission.bucket || ""

  const { t } = useTranslation()

  const [files, setFiles] = useState<File[] | []>([])

  const [alert, setAlert] = useState<boolean>(false)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [currentFilePath, setCurrentFilePath] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedBucket, setSelectedBucket] = useState<string>("")

  if (selectedBucket.length > 0) {
    console.log(
      "TESTI",
      buckets.filter(bucket => bucket.bucketName === selectedBucket)
    )
  }

  useEffect(() => {
    //   let isMounted = true
    const getBuckets = async () => {
      try {
        const response = await bucketsAPIService.getProjectBuckets(projectId)
        const bucketNames: string[] = response.data
        dispatch(setBuckets(bucketNames)) // works on second render????
        console.log("Before set", bucketNames)
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
    getBuckets()
    setIsLoading(false)
    //   return () => { // returns a cleanup function for effect
    //     isMounted = false
    //   }
  }, [projectId])

  // Error 400 for bucket no access is granted?? ErrorMonitor is temporary removed
  useEffect(() => {
    const getFiles = async () => {
      if (!!selectedBucket) {
        try {
          bucketsAPIService.grantAccessBucket(projectId, selectedBucket).then(res => {
            return res.data
          })
          const response = await bucketsAPIService.getBucketFiles(projectId, selectedBucket)
          if (response.status === 400) console.log("ERROR", response)
          else {
            console.log("RESPONSE FILES", response.data)
            dispatch(addFiles({ bucketName: selectedBucket, files: files }))
            setFiles(response.data) // THIS DOES NOT GET UPDATED ON FIRST
            console.log("files", files)
          }
          //setFiles(response.data)
        } catch (err) {
          console.log("CATCHING", err)
        }
      }
    }
    getFiles()
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
    // Calling the set function does not change the current state in the already executing code
    setSelectedBucket(event.target.value) // for next render

    dispatch(setUnsavedForm())
  }
  // TODO ????
  // mock file path:    "s3:/bucketA/folder3/folder3A/folder3B/fileA5"
  // actual Allas path: 'S3://sd-submit-test/metadata.json'

  const handleFilesView = (bucketName: string) => {
    console.log(
      "handle FILESVIEW",
      files.map(file => file.path.split("//")[1].split("/")[0])
    ) // WORKS
    console.log(
      "KUKKUU",
      files.filter(file => file.path === "S3://sd-submit-test/metadata.json")
    ) // undefined
    console.log("bucketName", bucketName)

    // return the path
    const currentPath = files
      .filter(file => file.path.split("//")[1].split("/")[0] === bucketName)[0]
      .path.split("/")
      .slice(0, 2)
      .join("/")
    console.log("CurrentPath", currentPath)
    setCurrentFilePath(currentPath)
    setBreadcrumbs([t("dataBucket.allBuckets"), bucketName])
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
  //TODO???
  const handleClickFileRow = (path: string, name: string) => {
    if (!isFile(files, path)) {
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
            {index === 0 ? t("dataBucket.allBuckets") : upperFirst(el)}
          </Link>
        ))}
      </Breadcrumbs>
    )

  const renderBucketTable = () =>
    !breadcrumbs.length &&
    (isLoading ? (
      <CircularProgress color="primary" />
    ) : (
      <WizardDataBucketTable
        selectedBucket={selectedBucket}
        linkedBucket={linkedBucket}
        handleBucketChange={handleBucketChange}
        handleFilesView={handleFilesView}
      />
    ))

  const renderFileTable = () =>
    !!breadcrumbs.length && (
      <WizardFilesTable
        currentFilePath={currentFilePath}
        files={files}
        handleClickFileRow={handleClickFileRow}
      />
    )

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
