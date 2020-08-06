//@flow
import React, { useEffect, useState } from "react"
import schemaAPIService from "services/schemaAPI"
import { useSelector } from "react-redux"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Form, Formik } from "formik"
import JSONSchemaParser from "./JSONSchemaParser"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  formComponents: {
    display: "flex",
    flexWrap: "wrap",
    "& .MuiTextField-root": {
      width: "45%",
      margin: theme.spacing(1),
    },
    "& .MuiTypography-root": {
      margin: theme.spacing(1),
      ...theme.typography.subtitle1,
      fontWeight: "bold",
    },
    "& .MuiTypography-h2": {
      width: "100%",
      color: theme.palette.secondary.main,
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiTypography-h3": {
      width: "45%",
    },
    "& .array": {
      margin: theme.spacing(1),
      width: "45%",
      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        width: "100%",
      },
    },
  },
}))

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

type FormFieldsProps = {
  formSchema: any,
}

const FormFields = ({ formSchema }: FormFieldsProps) => {
  const classes = useStyles()
  const components = JSONSchemaParser.buildFields(formSchema)
  return <div className={classes.formComponents}>{components}</div>
}

const FillObjectDetailsForm = () => {
  const { objectType } = useSelector(state => state.objectType)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formSchema, setFormSchema] = useState({})
  const [YupSchema, setYupSchema] = useState(null)
  const [initialValues, setInitialValues] = useState({})

  useEffect(() => {
    const fetchSchema = async () => {
      const response = await schemaAPIService.getSchemaByObjectType(objectType)
      if (response.ok) {
        await JSONSchemaParser.dereferenceSchema(response.data)
        setFormSchema(response.data)
        setYupSchema(await JSONSchemaParser.buildYupSchema(response.data))
        setInitialValues(await JSONSchemaParser.buildInitialValues(response.data))
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
      onSubmit={values => {
        console.log("JSON form successfully submitted")
        console.log(JSON.stringify(values, null, 2))
      }}
    >
      {() => (
        <Form>
          <FormFields formSchema={formSchema} />
        </Form>
      )}
    </Formik>
  )
}

export default FillObjectDetailsForm
