import React, { useState, forwardRef } from "react"

import CloseIcon from "@mui/icons-material/Close"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import { styled } from "@mui/material/styles"
import { GlobalStyles } from "@mui/system"
import { useTranslation } from "react-i18next"

import CSCtheme from "../theme"

import { ResponseStatus } from "constants/responseStatus"
import { resetStatusDetails } from "features/statusMessageSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { APIResponse } from "types"
type MessageHandlerProps = {
  response?: APIResponse
  helperText?: string
  handleClose: (status: boolean) => void
}

type HandlerRef =
  | ((instance: HTMLDivElement | null) => void)
  | React.RefObject<HTMLDivElement>
  | null
  | undefined

const CustomAlert = styled(Alert)(() => ({
  backgroundColor: CSCtheme.palette.background.paper,
  borderLeft: `1.25rem solid ${CSCtheme.palette.success.light}`,
  borderTop: `0.25rem solid ${CSCtheme.palette.success.light}`,
  borderRight: `0.25rem solid ${CSCtheme.palette.success.light}`,
  borderBottom: `0.25rem solid ${CSCtheme.palette.success.light}`,
  color: CSCtheme.palette.secondary.main,
  fontSize: "1.4286rem",
  fontWeight: "bold",
  lineHeight: "1.75",
  boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
  position: "relative",
  padding: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const ErrorHandler = forwardRef(function ErrorHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { t } = useTranslation()
  const { response, helperText, handleClose } = props
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
  return (
    <Alert
      severity="error"
      ref={ref}
      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <span style={{ flex: 7 }}>{message}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 3,
          justifyContent: "flex-end",
        }}
      >
        <CloseIcon
          fontSize="small"
          style={{ cursor: "pointer", color: CSCtheme.palette.primary.main, marginLeft: "20px" }}
          onClick={() => handleClose(false)}
        />
        <span
          style={{
            cursor: "pointer",
            color: CSCtheme.palette.primary.main,
            marginLeft: "0.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
          onClick={() => handleClose(false)}
        >
          Close
        </span>
      </div>
    </Alert>
  )
})

const InfoHandler = forwardRef(function InfoHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { t } = useTranslation()
  const { helperText, handleClose } = props
  const defaultMessage = t("snackbarMessages.info.default")

  const messageTemplate = (helperText?: string) => {
    return helperText?.length ? helperText : defaultMessage
  }

  return (
    <CustomAlert severity="info" ref={ref} icon={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ marginRight: "2.5rem" }}>{messageTemplate(helperText)}</div>
        <div style={{ display: "flex", alignItems: "center", flex: 3, justifyContent: "flex-end" }}>
          <CloseIcon
            fontSize="small"
            style={{ cursor: "pointer", color: CSCtheme.palette.primary.main }}
            onClick={() => handleClose(false)}
          />
          <span
            style={{
              cursor: "pointer",
              color: CSCtheme.palette.primary.main,
              marginLeft: "0.5rem",
              fontSize: "1.4rem",
              fontWeight: "bold",
            }}
            onClick={() => handleClose(false)}
          >
            Close
          </span>
        </div>
      </div>
    </CustomAlert>
  )
})

const SuccessHandler = forwardRef(function SuccessHandler(
  props: MessageHandlerProps,
  ref: HandlerRef
) {
  const { t } = useTranslation()
  const { response, helperText, handleClose } = props
  let message = ""
  if (response) {
    switch (response?.config?.baseURL) {
      case "/v1/drafts": {
        switch (response?.config.method) {
          case "patch": {
            message = t("snackbarMessages.success.drafts.updated", {
              accessionId: response.data.accessionId,
            })
            break
          }
          default: {
            message = t("snackbarMessages.success.drafts.saved", {
              accessionId: response.data.accessionId,
            })
          }
        }
        break
      }
      case "/v1/objects": {
        switch (response.config.method) {
          case "patch": {
            message = t("snackbarMessages.success.objects.updated", {
              accessionId: response.data.accessionId,
            })
            break
          }
          case "put": {
            message = t("snackbarMessages.success.objects.replaced", {
              accessionId: response.data.accessionId,
            })
            break
          }
          default: {
            message = t("snackbarMessages.success.objects.submitted", {
              accessionId: response.data.accessionId,
            })
          }
        }
        break
      }
      case "/v1/templates": {
        switch (response.config.method) {
          default: {
            message = t("snackbarMessages.success.templates.updated", {
              accessionId: response.data.accessionId,
            })
          }
        }
      }
    }
  } else {
    message = helperText ? (t(helperText) as string) : ""
  }

  return (
    <CustomAlert severity="success" ref={ref} icon={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ marginRight: "2.5rem" }}>{message}</div>
        <div style={{ display: "flex", alignItems: "center", flex: 3, justifyContent: "flex-end" }}>
          <CloseIcon
            fontSize="small"
            style={{ cursor: "pointer", color: CSCtheme.palette.primary.main }}
            onClick={() => handleClose(false)}
          />
          <span
            style={{
              cursor: "pointer",
              color: CSCtheme.palette.primary.main,
              marginLeft: "0.5rem",
              fontSize: "1.4rem",
              fontWeight: "bold",
            }}
            onClick={() => handleClose(false)}
          >
            Close
          </span>
        </div>
      </div>
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

const StatusMessageHandlerMain: React.FC = () => {
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

const GlobalCss = () => (
  <GlobalStyles
    styles={{
      ".css-ptiqhd-MuiSvgIcon-root": {
        fontSize: "2.5rem !important",
      },
      ".css-1e0d89p-MuiButtonBase-root-MuiIconButton-root": {
        color: `${CSCtheme.palette.primary.main} !important`,
        padding: "none !important",
      },
    }}
  />
)

const StatusMessageHandler = () => (
  <>
    <GlobalCss />
    <StatusMessageHandlerMain />
  </>
)

export default StatusMessageHandler
