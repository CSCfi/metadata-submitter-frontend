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

import WizardDataFolderTable from "components/SubmissionWizard/WizardComponents/WizardDataFolderTable"
import WizardFilesTable from "components/SubmissionWizard/WizardComponents/WizardFilesTable"
import { addLinkedFolder } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { isFile } from "utils"

const WizardDataFolderStep = () => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const linkedFolder = submission.linkedFolder || ""

  const { t } = useTranslation()

  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [currentFilePath, setCurrentFilePath] = useState<string>("")

  const handleLinkFolder = () => {
    dispatch(addLinkedFolder(selectedFolder))
    // TODO: Send request to backend to save linked folder name
  }

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFolder(event.target.value)
  }

  const handleFilesView = (folderName: string) => {
    const currentFolderPath = files
      .filter(file => file.path.split("/")[1] === folderName)[0]
      .path.split("/")
      .slice(0, 2)
      .join("/")
    setCurrentFilePath(currentFolderPath)
    setBreadcrumbs([t("datafolder.allFolders"), folderName])
  }

  const handleAddToBreadcrumbs = (subfolderName: string) => {
    setBreadcrumbs(prevState => [...prevState, subfolderName])
  }

  const handleClickBreadcrumb = (breadcrumb: string, index: number) => {
    /* Remove all breadcrumbs if "All folders" is clicked.
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
       * It means that the current file is still nested under subfolder
       */
      setCurrentFilePath(path)
      handleAddToBreadcrumbs(name)
    }
  }

  const linkFolderButton = (
    <Button
      disabled={!selectedFolder || !!linkedFolder}
      variant="contained"
      aria-label="link datafolder"
      size="small"
      type="submit"
      onClick={handleLinkFolder}
      data-testid="link-datafolder"
    >
      {t("datafolder.linkFolder")}
    </Button>
  )

  const renderHeading = () => (
    <Typography variant="h5" fontWeight="700" color="secondary">
      {linkedFolder ? t("datafolder.linkedFolder") : t("datafolder.linkFromSDConnect")}
    </Typography>
  )

  const renderBreadcrumbs = () =>
    !!breadcrumbs.length && (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="large" />}
        aria-label="folder-breadcrumb"
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
            {index === 0 ? t("datafolder.allFolders") : upperFirst(el)}
          </Link>
        ))}
      </Breadcrumbs>
    )

  const renderFolderTable = () =>
    !breadcrumbs.length && (
      <WizardDataFolderTable
        selectedFolder={selectedFolder}
        linkedFolder={linkedFolder}
        handleFolderChange={handleFolderChange}
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
      <WizardStepContentHeader action={linkFolderButton} />
      <Box display="flex" flexDirection="column" p="5rem" gap={4}>
        {renderHeading()}
        {renderBreadcrumbs()}
        {renderFolderTable()}
        {renderFileTable()}
      </Box>
    </Box>
  )
}

export default WizardDataFolderStep
