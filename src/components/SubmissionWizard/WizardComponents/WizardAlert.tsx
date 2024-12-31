import React, { useState, useEffect } from "react"

import WarningIcon from "@mui/icons-material/Warning"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"

import WizardDraftSelections from "./WizardDraftSelections"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setAlert, resetAlert } from "features/wizardAlertSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import type { ObjectInsideSubmissionWithTags } from "types"
import { getStudyStatus } from "utils"

const CustomDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1.25rem solid ${theme.palette.error.light}`,
    borderTop: `0.25rem solid ${theme.palette.error.light}`,
    borderRight: `0.25rem solid ${theme.palette.error.light}`,
    borderBottom: `0.25rem solid ${theme.palette.error.light}`,
    color: theme.palette.secondary.main,
    lineHeight: "1",
    boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    minWidth:"65rem"
  },
}))

const CustomBox = styled(Box)(() => ({
  width: "100%",
  padding: "1rem",
  paddingTop: "0",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
}))

const IconBox = styled(Box)(() => ({
  width: "10%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}))

const ContentBox = styled(Box)(() => ({
  width: "90%",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  paddingTop: 0,
}))

const CustomDialogTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: "1.5rem",
  fontWeight: "bold",
}))

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
  color: theme.palette.error.light,
  fontSize: "3rem",
}))

const CustomDialogContentText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.secondary.main,
  padding: "1rem",
  paddingTop: "0.5rem",
  paddingLeft: 0,
}))

// Simple template for error messages
const ErrorMessage = (props: { message: string }) => {
  return <Alert severity="error">{props.message}</Alert>
}

/*
 * Dialog contents are rendered based on parent component location and alert type
 */
const CancelFormDialog = ({
  handleDialog,
  alertType,
  parentLocation,
}: {
  handleDialog: (status: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => void
  alertType?: string
  parentLocation: string
  currentSubmissionType: string
}) => {
  const submission = useAppSelector(state => state.submission)
  const currentObject = useAppSelector(state => state.currentObject)
  const objectType = useAppSelector(state => state.objectType)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const dispatch = useAppDispatch()

  const submittedStudy: boolean = getStudyStatus(submission.metadataObjects)

  // Draft save logic
  const saveDraft = async () => {
    setError(false)

    const handleSave = await saveDraftHook({
      accessionId: currentObject.accessionId || currentObject.objectId,
      objectType: objectType,
      objectStatus: currentObject.status,
      submission: submission,
      values: currentObject.cleanedValues || currentObject,
      dispatch: dispatch,
    })

    if (handleSave.ok) {
      handleDialog(true)
    } else {
      setError(true)
      setErrorMessage(t("errors.connection.saveDraft"))
    }
  }

  const updateForm = async () => {
    const response = await objectAPIService.patchFromJSON(
      objectType,
      currentObject.accessionId,
      currentObject.cleanedValues
    )
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        updateStatus({
          status: ResponseStatus.success,
          response: response,
          helperText: "",
        })
      )
      dispatch(resetCurrentObject())
      handleDialog(true)
    } else {
      setError(true)
      setErrorMessage(t("errors.connection.updateObject"))
    }
  }

  const { t } = useTranslation()
  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions

  switch (parentLocation) {
    case "submission": {
      // Text depends on ObjectStatus or ObjectSubmissionType
      const textType =
        currentObject?.status === ObjectStatus.submitted ? "submitted" : alertType?.toLowerCase()
      dialogTitle = t(`${"alerts." + textType + ".title"}`)
      dialogContent = t(`${"alerts." + textType + ".content"}`)
      dialogActions = (
        <DialogActions>
          <Button variant="outlined" onClick={() => handleDialog(false)} color="primary">
            {t("alerts.actions.cancel")}
          </Button>
          <Button variant="contained" onClick={() => handleDialog(true)} color="primary">
            {t("alerts.actions.noSave")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              saveDraft()
            }}
            color="primary"
            disabled={submittedStudy && objectType === ObjectTypes.study}
          >
            {t("alerts.actions.saveDraft")}
          </Button>
          {textType === "submitted" && (
            <Button
              variant="contained"
              onClick={() => {
                updateForm()
              }}
              color="primary"
            >
              {t("alerts.actions.update")}
            </Button>
          )}
        </DialogActions>
      )
      break
    }
    case "header": {
      switch (alertType) {
        case "save": {
          dialogTitle = t("alerts.save.title")
          dialogContent = t("alerts.save.content")
          dialogActions = (
            <DialogActions style={{ justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => handleDialog(false)}
                color="primary"
                autoFocus
              >
                {t("alerts.actions.continueSubmission")}
              </Button>
              <Button
                variant="contained"
                aria-label="Save a new submission and move to frontpage"
                onClick={() => handleDialog(true)}
                color="primary"
              >
                {t("alerts.actions.saveExit")}
              </Button>
            </DialogActions>
          )
          break
        }
        case "publish": {
          // publish alert might not originate from header, move later
          dialogTitle = t("alerts.publish.title")
          dialogContent =
            submission?.drafts.length > 0
              ? t("alerts.publish.content.objects") + t("alerts.publish.content.chooseDrafts")
              : t("alerts.publish.content.objects")
          dialogActions = <WizardDraftSelections onHandleDialog={handleDialog} />
          break
        }
        default: {
          dialogTitle = "default"
          dialogContent = "default content"
        }
      }
      break
    }
    default: {
      dialogTitle = "default"
      dialogContent = "default content"
    }
  }

  return (
    <CustomDialog
      open={true}
      onClose={() => handleDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent style={{ paddingLeft: 0 }}>
        <CustomBox>
          <IconBox>
            <StyledWarningIcon />
          </IconBox>
          <ContentBox>
            <CustomDialogTitle id="alert-dialog-title">{dialogTitle}</CustomDialogTitle>
            <CustomDialogContentText
              id="alert-dialog-description"
              data-testid="alert-dialog-content"
            >
              {dialogContent}
            </CustomDialogContentText>
            {error && <ErrorMessage message={errorMessage} />}
            <DialogActions style={{ width: "100%", justifyContent: "flex-end", padding: "1rem" }}>
              {dialogActions}
            </DialogActions>
          </ContentBox>
        </CustomBox>
      </DialogContent>
    </CustomDialog>
  )
}

/*
 * Render alert form based on location and type
 */
const WizardAlert = ({
  onAlert,
  parentLocation,
  alertType,
}: {
  onAlert: (status: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => void
  parentLocation: string
  alertType?: string
}) => {
  const currentSubmissionType = useAppSelector(state => state.submissionType)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setAlert())
  }, [dispatch])

  const handleDialog = (action: boolean, formData?: Array<ObjectInsideSubmissionWithTags>) => {
    dispatch(resetAlert())
    onAlert(action, formData)
  }

  return (
    <div>
      <CancelFormDialog
        handleDialog={handleDialog}
        alertType={alertType}
        parentLocation={parentLocation}
        currentSubmissionType={currentSubmissionType}
      />
    </div>
  )
}

export default WizardAlert
