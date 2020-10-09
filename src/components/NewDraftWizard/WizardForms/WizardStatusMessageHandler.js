//@flow
import React, { useState } from "react"

import Snackbar from "@material-ui/core/Snackbar"
import Alert from "@material-ui/lab/Alert"
import { useDispatch } from "react-redux"

import { setErrorMessage } from "features/wizardErrorMessageSlice"

/*
 * Error messages are shown both in snackbar and Formik form errors. Latter needs error message from state
 */
const ErrorHandler = ({ response, prefixText }: { response: any, prefixText: string }) => {
  const [openStatus, setOpenStatus] = useState(true)
  const dispatch = useDispatch()
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
  dispatch(setErrorMessage(message))
  return (
    <div>
      <Snackbar open={openStatus}>
        <Alert
          severity="error"
          onClose={() => {
            setOpenStatus(false)
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  )
}

// Info messages
const InfoHandler = () => {
  const message = `For some reason, your file is still being saved
  to our database, please wait. If saving doesn't go through in two
  minutes, please try saving the file again.`

  return <Alert severity="info">{message}</Alert>
}

// Success messages
const SuccessHandler = ({ response }: { response: any }) => {
  const message = `Submitted with accessionid ${response.data.accessionId}`
  return <Alert severity="success">{message}</Alert>
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
  const messageTemplate = status => {
    switch (status) {
      case "success":
        return <SuccessHandler response={response}></SuccessHandler>
      case "info":
        return <InfoHandler></InfoHandler>
      case "error":
        return <ErrorHandler response={response} prefixText={prefixText}></ErrorHandler>
      default:
        return
    }
  }

  return <div>{!Array.isArray(response) && messageTemplate(successStatus)}</div>
}

export default WizardStatusMessageHandler
