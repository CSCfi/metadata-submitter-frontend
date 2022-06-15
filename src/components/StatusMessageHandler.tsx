import React, { useState } from "react"

import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"

import { ResponseStatus } from "constants/responseStatus"
import { resetStatusDetails } from "features/statusMessageSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { APIResponse } from "types"

type MessageHandlerProps = {
  response?: APIResponse
  helperText?: string
  handleClose: (status: boolean) => void
}

type HandlerRef = ((instance: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement> | null | undefined

/*
 * Error messages
 */
const ErrorHandler = React.forwardRef(function ErrorHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { response, helperText, handleClose } = props
  let message: string

  switch (response?.status) {
    case 504:
      message = `Unfortunately we couldn't connect to our server.`
      break
    case 404:
      message = `Unfortunately we couldn't connect to our server. Details: ${helperText}`
      break
    case 400:
      message = `${helperText} Details: ${response.data.detail}`
      break
    default:
      message = "Unfortunately an unexpected error happened on our servers"
  }
  return (
    <Alert severity="error" onClose={() => handleClose(false)} ref={ref}>
      {message}
    </Alert>
  )
})

// Info messages
const InfoHandler = React.forwardRef(function InfoHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { helperText, handleClose } = props
  const defaultMessage = `For some reason, your file is still being saved
  to our database, please wait. If saving doesn't go through in two
  minutes, please try saving the file again.`

  const messageTemplate = (helperText?: string) => {
    return helperText?.length ? helperText : defaultMessage
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="info" ref={ref}>
      {messageTemplate(helperText)}
    </Alert>
  )
})

// Success messages
const SuccessHandler = React.forwardRef(function SuccessHandler(props: MessageHandlerProps, ref: HandlerRef) {
  const { response, helperText, handleClose } = props
  let message = ""
  if (response) {
    switch (response?.config?.baseURL) {
      case "/v1/drafts": {
        switch (response?.config.method) {
          case "patch": {
            message = `Draft updated with accessionid ${response.data.accessionId}`
            break
          }
          default: {
            message = `Draft saved with accessionid ${response.data.accessionId}`
          }
        }
        break
      }
      case "/v1/objects": {
        switch (response.config.method) {
          case "patch": {
            message = `Object updated with accessionid ${response.data.accessionId}`
            break
          }
          case "put": {
            message = `Object replaced with accessionid ${response.data.accessionId}`
            break
          }
          default: {
            message = `Submitted with accessionid ${response.data.accessionId}`
          }
        }
        break
      }
      case "/v1/templates": {
        switch (response.config.method) {
          default: {
            message = `Template updated with accessionid ${response.data.accessionId}`
          }
        }
      }
    }
  } else {
    message = helperText as string
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="success" ref={ref}>
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
        return <SuccessHandler handleClose={handleClose} response={response} helperText={helperText} />
      case ResponseStatus.info:
        return <InfoHandler handleClose={handleClose} helperText={helperText} />
      case ResponseStatus.error:
        return <ErrorHandler handleClose={handleClose} response={response} helperText={helperText} />
      default:
        return
    }
  }

  const handleClose = (status = false) => {
    setOpen(status)
    dispatch(resetStatusDetails())
  }

  return (
    <Snackbar autoHideDuration={autoHideDuration} open={open} onClose={() => handleClose()}>
      {messageTemplate(status)}
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
            typeof statusDetails.response === "string" ? JSON.parse(statusDetails.response) : statusDetails.response
          }
          helperText={statusDetails.helperText}
        />
      )}
    </React.Fragment>
  )
}

export default StatusMessageHandler
