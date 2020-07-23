//@flow
import React, { useEffect, useState } from "react"
import Form from "@rjsf/material-ui"
import SelectWidget from "./CustomJSONSchemaFormComponents/SelectWidget"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import { useSelector } from "react-redux"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import analysisUiSchema from "./UiSchemas/analysis.json"
import datasetUiSchema from "./UiSchemas/dataset.json"
import experimentUiSchema from "./UiSchemas/experiment.json"
import policyUiSchema from "./UiSchemas/policy.json"
import runUiSchema from "./UiSchemas/run.json"
import sampleUiSchema from "./UiSchemas/sample.json"
import studyUiSchema from "./UiSchemas/study.json"

const uiSchemas = {
  analysis: analysisUiSchema,
  dataset: datasetUiSchema,
  experiment: experimentUiSchema,
  policy: policyUiSchema,
  run: runUiSchema,
  sample: sampleUiSchema,
  study: studyUiSchema,
}

const checkResponseError = response => {
  switch (response.status) {
    case 504:
      return `Unfortunately we couldn't connect to our server to catch this form.`
    case 400:
      return `Unfortunately an error happened when connection to our to catch this form, 
        details: ${response.data}`
    default:
      return "Unfortunately an unexpected error happened on our servers"
  }
}

const FillObjectDetailsForm = () => {
  const [formData, setFormData] = useState(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successStatus, setSuccessStatus] = useState("info")
  const { objectType } = useSelector(state => state.objectType)
  const [formSchema, setFormSchema] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSchema = async () => {
      const response = await schemaAPIService.getSchemaByObjectType(objectType)
      if (response.ok) {
        setFormSchema(response.data)
      } else {
        setError(checkResponseError(response))
      }
      setIsLoading(false)
    }
    fetchSchema()
  }, [objectType])

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  return (
    <div>
      <Form
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
        schema={formSchema}
        uiSchema={uiSchemas[objectType]}
        formData={formData}
        onChange={event => setFormData(event.formData)}
        showErrorList={false}
        widgets={{ SelectWidget }}
        noHtml5Validate
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
