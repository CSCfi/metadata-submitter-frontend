//@flow
import React, { useEffect, useState } from "react"
import schemaAPIService from "services/schemaAPI"
import { useSelector } from "react-redux"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Form, Formik } from "formik"
import JSONSchemaParser from "./JSONSchemaParser"
import Button from "@material-ui/core/Button"

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
      {({ submitForm, isSubmitting }) => (
        <Form>
          {formFields}
          <Button
            key="button"
            variant="outlined"
            color="primary"
            disabled={isSubmitting}
            onClick={submitForm}
          >
            Save
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default FillObjectDetailsForm
