import React, { useEffect } from "react"

import WarningIcon from "@mui/icons-material/Warning"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import { setAlert, resetAlert } from "features/wizardAlertSlice"
import { useAppDispatch } from "hooks"
import type { CurrentFormObject } from "types"

const CustomDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1.25rem solid ${theme.palette.warning.main}`,
    borderTop: `0.25rem solid ${theme.palette.warning.main}`,
    borderRight: `0.25rem solid ${theme.palette.warning.main}`,
    borderBottom: `0.25rem solid ${theme.palette.warning.main}`,
    lineHeight: "1",
    boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
}))

const CustomBox = styled(Box)(() => ({
  width: "100%",
  padding: "0 3rem",
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
  minWidth: "45rem",
  display: "flex",
  flexDirection: "column",
  paddingLeft: "2rem",
}))

const CustomDialogTitle = styled(Typography)(() => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
}))

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: "3rem",
}))

const CustomDialogContentText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: "1rem",
  paddingTop: "0.5rem",
  paddingLeft: 0,
}))

/*
 * Dialog contents are rendered based on parent component location and alert type
 */
const CancelFormDialog = ({
  handleDialog,
  alertType,
  parentLocation,
}: {
  handleDialog: (status: boolean, formData?: CurrentFormObject[]) => void
  alertType?: string
  parentLocation: string
}) => {
  const { t } = useTranslation()
  let [dialogTitle, dialogContent] = ["", ""]
  let dialogActions

  switch (parentLocation) {
    case "submission": {
      switch (alertType) {
        case "exit": {
          dialogTitle = t("alerts.exit.title")
          dialogContent = t("alerts.exit.content")
          dialogActions = (
            <DialogActions>
              <Button variant="outlined" onClick={() => handleDialog(true)} color="primary">
                {t("alerts.actions.exit")}
              </Button>
              <Button variant="contained" onClick={() => handleDialog(false)} color="primary">
                {t("alerts.actions.cancel")}
              </Button>
            </DialogActions>
          )
          break
        }
        case "link": {
          dialogContent = t("alerts.link.content")
          dialogActions = (
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => handleDialog(true)}
                color="primary"
                data-testid="link-bucket-confirm"
              >
                {t("alerts.actions.link")}
              </Button>
              <Button variant="contained" onClick={() => handleDialog(false)} color="primary">
                {t("alerts.actions.cancel")}
              </Button>
            </DialogActions>
          )
          break
        }
        default: {
          dialogTitle = "default"
          dialogContent = "default content"
        }
      }
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
                aria-label={t("ariaLabels.saveSubmission")}
                onClick={() => handleDialog(true)}
                color="primary"
              >
                {t("alerts.actions.saveExit")}
              </Button>
            </DialogActions>
          )
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
  onAlert: (status: boolean, formData?: CurrentFormObject[]) => void
  parentLocation: string
  alertType?: string
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setAlert())
  }, [dispatch])

  const handleDialog = (action: boolean, formData?: CurrentFormObject[]) => {
    dispatch(resetAlert())
    onAlert(action, formData)
  }

  return (
    <div>
      <CancelFormDialog
        handleDialog={handleDialog}
        alertType={alertType}
        parentLocation={parentLocation}
      />
    </div>
  )
}

export default WizardAlert
