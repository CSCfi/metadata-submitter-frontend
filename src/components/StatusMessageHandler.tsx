import React, { useState } from "react"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { useTranslation } from "react-i18next"
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

const ErrorHandler = React.forwardRef(function ErrorHandler(
  props: MessageHandlerProps,
  ref: HandlerRef
) {
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
    <Alert severity="error" onClose={() => handleClose(false)} ref={ref}>
      {message}
    </Alert>
  )
})

const InfoHandler = React.forwardRef(function InfoHandler(
  props: MessageHandlerProps,
  ref: HandlerRef
) {
  const { t } = useTranslation()
  const { helperText, handleClose } = props
  const defaultMessage = t("snackbarMessages.info.default")

  const messageTemplate = (helperText?: string) => {
    return helperText?.length ? helperText : defaultMessage
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="info" ref={ref}>
      {messageTemplate(helperText)}
    </Alert>
  )
})

const SuccessHandler = React.forwardRef(function SuccessHandler(
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
    <Alert
      onClose={() => handleClose(false)}
      severity="success"
      ref={ref}
      sx={{
        backgroundColor: "#ffffff",
        borderLeft: "7px solid #51a808",
        borderTop: "1px solid #51a808",
        borderRight: "1px solid #51a808",
        borderBottom: "1px solid #51a808",
        color: "black",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
      }}
      icon={false}
    >
      {message}
    </Alert>
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
  const autoHideDuration = 6000
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
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => handleClose(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            width: "auto",
            marginBottom: "50px",
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
