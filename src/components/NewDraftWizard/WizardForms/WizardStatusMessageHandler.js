//@flow
import React, { useState } from "react"

import Snackbar from "@material-ui/core/Snackbar"
import Alert from "@material-ui/lab/Alert"
import { useDispatch } from "react-redux"

import { resetStatusDetails } from "features/wizardStatusMessageSlice"

/*
 * Error messages
 */
const ErrorHandler = ({
  response,
  prefixText,
  handleClose,
}: {
  response: any,
  prefixText: string,
  handleClose: boolean => void,
}) => {
  let message = ""
  switch (response.status) {
    case 504:
      message = `Unfortunately we couldn't connect to our server.`
      break
    case 400:
      message = `${prefixText}, details: ${response.data.detail}`
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
const InfoHandler = ({ handleClose }: { handleClose: boolean => void }) => {
  const message = `For some reason, your file is still being saved
  to our database, please wait. If saving doesn't go through in two
  minutes, please try saving the file again.`

  return (
    <Alert onClose={() => handleClose(false)} severity="info">
      {message}
    </Alert>
  )
}

// Success messages
const SuccessHandler = ({ response, handleClose }: { response: any, handleClose: boolean => void }) => {
  let message = ""

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
    }
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="success">
      {message}
    </Alert>
  )
}

const WizardStatusMessageHandler = ({
  successStatus,
  response,
  prefixText,
}: {
  successStatus: string,
  response: any,
  prefixText: string,
}) => {
  const [openStatus, setOpenStatus] = useState(true)
  const dispatch = useDispatch()
  const messageTemplate = status => {
    switch (status) {
      case "success":
        return <SuccessHandler handleClose={handleClose} response={response} />
      case "info":
        return <InfoHandler handleClose={handleClose} />
      case "error":
        return <ErrorHandler handleClose={handleClose} response={response} prefixText={prefixText} />
      default:
        return
    }
  }

  const handleClose = status => {
    setOpenStatus(status)
    dispatch(resetStatusDetails())
  }

  return (
    <div>
      <Snackbar autoHideDuration={6000} open={openStatus} onClose={() => handleClose()}>
        {!Array.isArray(response) && messageTemplate(successStatus)}
      </Snackbar>
    </div>
  )
}

export default WizardStatusMessageHandler
