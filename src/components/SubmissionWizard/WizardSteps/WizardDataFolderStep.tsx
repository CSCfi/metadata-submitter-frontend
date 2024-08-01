import React from "react"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"

import WizardDataFolderTable from "components/SubmissionWizard/WizardComponents/WizardDataFolderTable"
import { addLinkedFolder } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"

const WizardDataFolderStep = () => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const linkedFolder = submission.linkedFolder || ""
  const { t } = useTranslation()
  const [selectedFolder, setSelectedFolder] = React.useState("")

  const handleLinkFolder = () => {
    dispatch(addLinkedFolder(selectedFolder))
    // TODO: Send request to backend to save linked folder name
  }

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFolder(event.target.value)
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

  return (
    <Box>
      <WizardStepContentHeader action={linkFolderButton} />
      <Box display="flex" flexDirection="column" p="5rem" gap={4}>
        <Typography variant="h5" fontWeight="700" color="secondary">
          {linkedFolder ? t("datafolder.linkedFolder") : t("datafolder.linkFromSDConnect")}
        </Typography>
        <WizardDataFolderTable
          selectedFolder={selectedFolder}
          linkedFolder={linkedFolder}
          handleFolderChange={handleFolderChange}
        />
      </Box>
    </Box>
  )
}

export default WizardDataFolderStep
