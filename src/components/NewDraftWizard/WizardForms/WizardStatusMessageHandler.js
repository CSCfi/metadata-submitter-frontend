//@flow
import React, { useState } from "react"

import Snackbar from "@material-ui/core/Snackbar"
import Alert from "@material-ui/lab/Alert"
import { useDispatch } from "react-redux"

import { WizardStatus } from "constants/wizardStatus"
import { resetStatusDetails } from "features/wizardStatusMessageSlice"

/*
 * Error messages
 */
const ErrorHandler = ({
  response,
  prefixText,
  handleClose,
}: {
  response: Object,
  prefixText: string,
  handleClose: boolean => void,
}) => {
  let message = ""
  switch (response.status) {
    case 504:
      message = `Unfortunately we couldn't connect to our server.`
      break
    case 400:
      message = `${prefixText} Details: ${response.data.detail}`
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
const InfoHandler = ({ handleClose, prefixText }: { handleClose: boolean => void, prefixText?: string }) => {
  const defaultMessage = `For some reason, your file is still being saved
  to our database, please wait. If saving doesn't go through in two
  minutes, please try saving the file again.`

  const messageTemplate = (prefixText?: string) => {
    return prefixText?.length ? prefixText : defaultMessage
  }

  return (
    <Alert onClose={() => handleClose(false)} severity="info">
      {messageTemplate(prefixText)}
    </Alert>
  )
}

// Success messages
const SuccessHandler = ({ response, handleClose }: { response: Object, handleClose: boolean => void }) => {
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
  response: Object,
  prefixText: string,
}): React$Element<any> => {
  const [openStatus, setOpenStatus] = useState(true)
  const dispatch = useDispatch()
  const messageTemplate = status => {
    switch (status) {
      case WizardStatus.success:
        return <SuccessHandler handleClose={handleClose} response={response} />
      case WizardStatus.info:
        return <InfoHandler handleClose={handleClose} prefixText={prefixText} />
      case WizardStatus.error:
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
