//@flow
import React, { useState } from "react"

import Alert from "@mui/lab/Alert"
import Snackbar from "@mui/material/Snackbar"
import { useDispatch, useSelector } from "react-redux"

import { ResponseStatus } from "constants/responseStatus"
import { resetStatusDetails } from "features/statusMessageSlice"

/*
 * Error messages
 */
const ErrorHandler = ({
  response,
  helperText,
  handleClose,
}: {
  response: Object,
  helperText: string,
  handleClose: boolean => void,
}) => {
  let message: string

  switch (response.status) {
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
    <div>
      <Alert severity="error" onClose={() => handleClose(false)}>
        {message}
      </Alert>
    </div>
  )
}

// Info messages
const InfoHandler = ({ handleClose, helperText }: { handleClose: boolean => void, helperText?: string }) => {
  const defaultMessage = `For some reason, your file is still being saved
  to our database, please wait. If saving doesn't go through in two
  minutes, please try saving the file again.`

  const messageTemplate = (helperText?: string) => {
    return helperText?.length ? helperText : defaultMessage
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="info">
      {messageTemplate(helperText)}
    </Alert>
  )
}

// Success messages
const SuccessHandler = ({
  response,
  helperText,
  handleClose,
}: {
  response: Object,
  helperText: string,
  handleClose: boolean => void,
}) => {
  let message: string

  if (response) {
    switch (response.config.baseURL) {
      case "/drafts": {
        switch (response.config.method) {
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
      case "/objects": {
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
      case "/templates": {
        switch (response.config.method) {
          default: {
            message = `Template updated with accessionid ${response.data.accessionId}`
          }
        }
      }
    }
  } else {
    message = helperText
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="success">
      {message}
    </Alert>
  )
}

const Message = ({
  status,
  response,
  helperText,
}: {
  status: string,
  response: Object,
  helperText: string,
}): React$Element<any> => {
  const [open, setOpen] = useState(true)
  const autoHideDuration = 6000
  const dispatch = useDispatch()

  const messageTemplate = status => {
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

  const handleClose = status => {
    setOpen(status)
    dispatch(resetStatusDetails())
  }

  return (
    <Snackbar autoHideDuration={autoHideDuration} open={open} onClose={() => handleClose()}>
      {messageTemplate(status)}
    </Snackbar>
  )
}

const StatusMessageHandler = (): React$Element<any> => {
  const statusDetails = useSelector(state => state.statusDetails)

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
