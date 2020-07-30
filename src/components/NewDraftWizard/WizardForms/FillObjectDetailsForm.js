//@flow
import React, { useEffect, useState } from "react"
import schemaAPIService from "services/schemaAPI"
import { useSelector } from "react-redux"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Field, FieldArray, Form, Formik } from "formik"
import JSONSchemaParser from "./JSONSchemaParser"
import Button from "@material-ui/core/Button"
import { TextField, Select } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"

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
        setYupSchema(await JSONSchemaParser.buildYupSchema(response.data))
        setFormFields(
          await JSONSchemaParser.buildFieldsAndInitialValues(response.data)
        )
        setInitialValues({
          descriptor: {
            studyTitle: "",
            studyType: "",
            studyAbstract: "",
            centerName: "",
          },
          studyDescription: "",
          pubMedID: "",
          center: {
            centerProjectName: "",
          },
          studyLinks: {
            xrefLinks: [],
          },
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
    <Formik
      initialValues={initialValues}
      validationSchema={YupSchema}
      onSubmit={values => console.log(values)}
    >
      {({ values, submitForm, isSubmitting }) => (
        <Form>
          {formFields}
        </Form>
      )}
    </Formik>
  )
}

export default FillObjectDetailsForm
