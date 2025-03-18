import React, { useState, forwardRef } from "react"

import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import WarningIcon from "@mui/icons-material/Warning"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Snackbar from "@mui/material/Snackbar"
import { styled, useTheme } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import { ResponseStatus } from "constants/responseStatus"
import { resetStatusDetails } from "features/statusMessageSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { APIResponse, HandlerRef } from "types"

type MessageHandlerProps = {
  response?: APIResponse
  helperText?: string
  handleClose: (status: boolean) => void
}

const CustomAlert = styled(Alert, {
  shouldForwardProp: prop => prop !== "severity",
})(({ theme, severity }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "warning"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderTop: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "warning"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderRight: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "warning"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderBottom: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "warning"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  color: theme.palette.secondary.main,
  lineHeight: "1.75",
  boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
  position: "relative",
  padding: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const AlertWrap = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const MessageContainer = styled(Typography)(() => ({
  fontSize: "1.5rem !important",
  fontWeight: "bold",
}))

const CustomIconButton = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  color: theme.palette.primary.main,
}))

const CustomCloseIcon = styled(CloseIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "2.25rem",
  marginLeft: "1rem",
}))

const ClosingLink = styled(Typography)(() => ({
  marginLeft: "0.75rem",
  fontSize: "1.5rem !important",
  fontWeight: "bold",
}))

const getSeverityIcon = (severity, theme) => {
  const iconStyle = {
    fontSize: "2rem",
    color:
      severity === "error"
        ? theme.palette.error.main
        : severity === "warning"
        ? theme.palette.warning.main
        : theme.palette.success.light,
  }

  switch (severity) {
    case "error":
      return <CancelIcon style={iconStyle} />
    case "warning":
      return <WarningIcon style={iconStyle} />
    case "success":
      return <CheckCircleIcon style={iconStyle} />
    default:
      return null
  }
}

const ErrorHandler = forwardRef(function ErrorHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { t } = useTranslation()
  const { response, helperText, handleClose } = props
  const theme = useTheme()
  let message: string

  switch (response?.status) {
    case 504:
      message = t("snackbarMessages.error.504")
      break
    case 400:
      message = t("snackbarMessages.error.400", {
        helperText,
        responseDetail: response.data.detail,
      })
      break
    default:
      message = t("snackbarMessages.error.default", { helperText: helperText ? t(helperText) : "" })
  }

  const closeMessage = t("close")

  return (
    <CustomAlert severity="error" ref={ref} icon={getSeverityIcon("error", theme)}>
      <AlertWrap>
        <MessageContainer>{message}</MessageContainer>
        <CustomIconButton onClick={() => handleClose(false)}>
          <CustomCloseIcon />
          <ClosingLink>{closeMessage}</ClosingLink>
        </CustomIconButton>
      </AlertWrap>
    </CustomAlert>
  )
})

const InfoHandler = forwardRef(function InfoHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { t } = useTranslation()
  const { helperText, handleClose } = props
  const theme = useTheme()
  const defaultMessage = t("snackbarMessages.info.default")
  const closeMessage = t("close")

  const messageTemplate = (helperText?: string) => {
    return helperText?.length ? helperText : defaultMessage
  }

  return (
    <CustomAlert severity="warning" ref={ref} icon={getSeverityIcon("warning", theme)}>
      <AlertWrap>
        <MessageContainer>{messageTemplate(helperText)}</MessageContainer>
        <CustomIconButton onClick={() => handleClose(false)}>
          <CustomCloseIcon />
          <ClosingLink>{closeMessage}</ClosingLink>
        </CustomIconButton>
      </AlertWrap>
    </CustomAlert>
  )
})

const SuccessHandler = forwardRef(function SuccessHandler(
  props: MessageHandlerProps,
  ref: HandlerRef
) {
  const { t } = useTranslation()
  const { response, helperText, handleClose } = props
  const theme = useTheme()
  let message = ""
  if (response) {
    switch (response?.config?.baseURL) {
      case "/v1/drafts": {
        switch (response?.config.method) {
          case "patch": {
            message = t("snackbarMessages.success.drafts.updated")
            break
          }
          default: {
            message = t("snackbarMessages.success.drafts.saved")
          }
        }
        break
      }
      case "/v1/objects": {
        switch (response.config.method) {
          case "patch": {
            message = t("snackbarMessages.success.objects.updated")
            break
          }
          case "put": {
            message = t("snackbarMessages.success.objects.replaced")
            break
          }
          default: {
            message = t("snackbarMessages.success.objects.submitted")
          }
        }
        break
      }
      case "/v1/templates": {
        switch (response.config.method) {
          default: {
            message = t("snackbarMessages.success.templates.updated")
          }
        }
      }
    }
  } else {
    message = helperText ? (t(helperText) as string) : ""
  }

  const closeMessage = t("close")

  return (
    <CustomAlert severity="success" ref={ref} icon={getSeverityIcon("success", theme)}>
      <AlertWrap>
        <MessageContainer>{message}</MessageContainer>
        <CustomIconButton onClick={() => handleClose(false)}>
          <CustomCloseIcon />
          <ClosingLink>{closeMessage}</ClosingLink>
        </CustomIconButton>
      </AlertWrap>
    </CustomAlert>
  )
})

type StatusMessageProps = {
  status: string
  response?: APIResponse
  helperText?: string
}

const Message = (props: StatusMessageProps) => {
  const { status, response, helperText } = props
  const [open, setOpen] = useState(true)
  const autoHideDuration = 20000
  const dispatch = useAppDispatch()

  const messageTemplate = (status: string) => {
    switch (status) {
      case ResponseStatus.success:
        return (
          <SuccessHandler handleClose={handleClose} response={response} helperText={helperText} />
        )
      case ResponseStatus.info:
        return <InfoHandler handleClose={handleClose} helperText={helperText} />
      case ResponseStatus.error:
        return (
          <ErrorHandler handleClose={handleClose} response={response} helperText={helperText} />
        )
      default:
        return null
    }
  }

  const handleClose = (status = false) => {
    setOpen(status)
    dispatch(resetStatusDetails())
  }

  const messageElement = messageTemplate(status)

  return typeof response !== "undefined" && response.status === 404
    ? null
    : messageElement && (
        <Snackbar
          autoHideDuration={autoHideDuration}
          open={open}
          onClose={() => handleClose()}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            width: "auto",
            marginBottom: "4.375rem",
          }}
        >
          {messageElement}
        </Snackbar>
      )
}

const StatusMessageHandler: React.FC = () => {
  const statusDetails = useAppSelector(state => state.statusDetails)
  return (
    <React.Fragment>
      {statusDetails?.status && !Array.isArray(statusDetails.response) && (
        <Message
          status={statusDetails.status}
          response={
            typeof statusDetails.response === "string"
              ? JSON.parse(statusDetails.response)
              : statusDetails.response
          }
          helperText={statusDetails.helperText}
        />
      )}
    </React.Fragment>
  )
}

export default StatusMessageHandler
