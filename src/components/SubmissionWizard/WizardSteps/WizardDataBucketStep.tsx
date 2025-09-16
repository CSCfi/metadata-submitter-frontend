import React, { useState } from "react"

import HomeIcon from "@mui/icons-material/Home"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { upperFirst } from "lodash"
import { useTranslation } from "react-i18next"

import { files } from "../../../../playwright/fixtures/files_response" // MOCK files array
import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"

import WizardAlert from "components/SubmissionWizard/WizardComponents/WizardAlert"
import WizardDataBucketTable from "components/SubmissionWizard/WizardComponents/WizardDataBucketTable"
import WizardFilesTable from "components/SubmissionWizard/WizardComponents/WizardFilesTable"
import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"
import { addBucketToSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { isFile } from "utils"

/*
 * Render buckets and files from SD Connect based on user selection
 */
const WizardDataBucketStep = () => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const bucket = submission.bucket || ""

  const { t } = useTranslation()

  const [selectedBucket, setSelectedBucket] = useState<string>("")
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [currentFilePath, setCurrentFilePath] = useState<string>("")
  const [alert, setAlert] = useState<boolean>(false)

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
    const currentPath = files
      .filter(file => file.path.split("/")[1] === bucketName)[0]
      .path.split("/")
      .slice(0, 2)
      .join("/")
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
      disabled={!selectedBucket || !!bucket}
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
      {bucket ? t("dataBucket.linkedBucket") : t("dataBucket.linkFromSDConnect")}
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
    !breadcrumbs.length && (
      <WizardDataBucketTable
        selectedBucket={selectedBucket}
        bucket={bucket}
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
