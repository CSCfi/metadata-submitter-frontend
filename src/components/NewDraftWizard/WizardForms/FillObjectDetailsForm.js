//@flow
import React, { useEffect, useState } from "react"
import schemaAPIService from "services/schemaAPI"
import { useSelector } from "react-redux"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import analysisUiSchema from "./UiSchemas/analysis.json"
import datasetUiSchema from "./UiSchemas/dataset.json"
import experimentUiSchema from "./UiSchemas/experiment.json"
import policyUiSchema from "./UiSchemas/policy.json"
import runUiSchema from "./UiSchemas/run.json"
import sampleUiSchema from "./UiSchemas/sample.json"
import studyUiSchema from "./UiSchemas/study.json"
import { Form, Formik } from "formik"
import JSONSchemaParser from "./JSONSchemaParser"

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
  const { objectType } = useSelector(state => state.objectType)
  const [YupSchema, setYupSchema] = useState(null)
  const [formFields, setFormFields] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSchema = async () => {
      const response = await schemaAPIService.getSchemaByObjectType(objectType)
      if (response.ok) {
        setYupSchema(await JSONSchemaParser.parse_schema(response.data))
        setFormFields([])
        setInitialValues({
          "descriptor" : {
            "studyTitle" : "",
            "studyAbstract" : ""
          }
        })
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
      <Formik
        initialValues={initialValues}
        validationSchema={yupSchema}
        onSubmit={values => console.log(values)}
      >
        <Form>{formFields}</Form>
      </Formik>
    </div>
  )
}

export default FillObjectDetailsForm
