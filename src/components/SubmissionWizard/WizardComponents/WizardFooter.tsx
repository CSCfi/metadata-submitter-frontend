import React, { useState } from "react"

import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import { styled } from "@mui/system"
import { useNavigate, Link as RouterLink } from "react-router-dom"

import WizardAlert from "./WizardAlert"

import saveDraftsAsTemplates from "components/SubmissionWizard/WizardHooks/WizardSaveTemplatesHook"
import { ResponseStatus } from "constants/responseStatus"
import { resetFileTypes } from "features/fileTypesSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { publishSubmissionContent, deleteSubmissionAndContent, resetSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { ObjectInsideSubmissionWithTags } from "types"
import { useQuery, pathWithLocale } from "utils"

const FooterRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  flexShrink: 0,
  borderTop: "solid 1px #ccc",
  backgroundColor: theme.palette.background.default,
  position: "fixed",
  zIndex: 1,
  left: 0,
  bottom: 0,
  padding: "10px",
  height: "60px",
  width: "100%",
}))

const Phantom = styled("div")({
  display: "block",
  padding: "20px",
  height: "60px",
  width: "100%",
})

/**
 * Define wizard footer with changing button actions.
 */
const WizardFooter: React.FC = () => {
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(state => state.projectId)
  const submission = useAppSelector(state => state.submission)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertType, setAlertType] = useState("")

  const navigate = useNavigate()

  const queryParams = useQuery()
  const step = Number(queryParams.get("step"))
  const wizardStep = Number(step.toString().slice(-1))

  const resetDispatch = () => {
    navigate(pathWithLocale("home"))
    dispatch(resetObjectType())
    dispatch(resetSubmission())
  }

  const handleAlert = async (alertWizard: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => {
    if (alertWizard && alertType === "cancel") {
      dispatch(deleteSubmissionAndContent(submission.submissionId))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "",
            })
          )
        })
    } else if (alertWizard && alertType === "save") {
      resetDispatch()
    } else if (alertWizard && alertType === "publish") {
      if (formData && formData?.length > 0) {
        await saveDraftsAsTemplates(projectId, formData, dispatch)
      }
      // Publish the submission
      dispatch(publishSubmissionContent(submission))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: `Couldn't publish submission with id ${submission.submissionId}`,
            })
          )
        })
      dispatch(resetFileTypes())
    } else {
      setDialogOpen(false)
    }
    setDialogOpen(false)
  }

  const disablePublishButton = () => {
    if (wizardStep !== 2) {
      return true
    }
    if (submission && wizardStep === 2) {
      const { metadataObjects } = submission
      if (metadataObjects.length === 0) {
        return true
      }
    }
  }

  return (
    <div>
      <Phantom />
      <FooterRow>
        <div>
          {wizardStep < 0 && (
            <Link component={RouterLink} aria-label="Cancel at the pre-step and move to frontpage" to="/home">
              <Button variant="contained" color="secondary">
                Cancel
              </Button>
            </Link>
          )}
          {wizardStep >= 0 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setDialogOpen(true)
                setAlertType("cancel")
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {wizardStep >= 0 && (
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={wizardStep < 1}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("save")
              }}
            >
              Save and Exit
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={disablePublishButton()}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("publish")
              }}
            >
              Publish
            </Button>
          </div>
        )}
      </FooterRow>
      {dialogOpen && <WizardAlert onAlert={handleAlert} parentLocation="footer" alertType={alertType}></WizardAlert>}
    </div>
  )
}

export default WizardFooter
