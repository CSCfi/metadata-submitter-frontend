//@flow
import React, { useState } from "react"
import Form from "@rjsf/material-ui"
import studySchema from "schemas/study_schema"
import TextWidget from "./form_components/TextWidget"
import SelectWidget from "./form_components/SelectWidget"
import objectAPIService from "../services/objectAPI"
import { useSelector } from "react-redux"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"

const checkResponseError = response => {
  switch (response.status) {
    case 504:
      return `Unfortunately we couldn't connect to our server to validate your 
        file.`
    case 400:
      return `Unfortunately an error happened when saving your file to our 
        servers, details: ${response.data}`
    default:
      return "Unfortunately an unexpected error happened on our servers"
  }
}

const uiSchema = {
  studyDescription: {
    "ui:widget": "textarea",
    "ui:options": {
      rows: 5,
    },
  },
}

const FillObjectDetailsForm = () => {
  const [formData, setFormData] = useState(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successStatus, setSuccessStatus] = useState("info")
  const { objectType } = useSelector(state => state.objectType)

  return (
    <div>
      <Form
        liveValidate
        onSubmit={async () => {
          setSubmitting(true)
          const waitForServertimer = setTimeout(() => {
            setSuccessStatus("info")
            setSuccessMessage(`For some reason, your file is still being saved
            to our database, please wait. If saving doesn't go through in two
            minutes, please try saving the file again.`)
          }, 5000)

          const response = await objectAPIService.createFromJSON(
            objectType,
            formData
          )

          if (response.ok) {
            setSuccessStatus("success")
            setSuccessMessage(
              `Submitted with accessionid ${response.data.accessionId}`
            )
          } else {
            setSuccessStatus("error")
            setSuccessMessage(checkResponseError(response))
          }
          clearTimeout(waitForServertimer)
          setSubmitting(false)
        }}
        schema={studySchema}
        formData={formData}
        onChange={event => setFormData(event.formData)}
        showErrorList={false}
        uiSchema={uiSchema}
        widgets={{ TextWidget, SelectWidget }}
      />
      {isSubmitting && <LinearProgress />}

      {successMessage && (
        <Alert
          severity={successStatus}
          onClose={() => {
            setSuccessMessage("")
          }}
        >
          {successMessage}
        </Alert>
      )}
    </div>
  )
}

export default FillObjectDetailsForm
