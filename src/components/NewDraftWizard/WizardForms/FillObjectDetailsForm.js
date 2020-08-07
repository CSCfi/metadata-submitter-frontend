//@flow
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import JSONSchemaParser from "./JSONSchemaParser"
import React, { useEffect, useState } from "react"
import schemaAPIService from "services/schemaAPI"
import { makeStyles } from "@material-ui/core/styles"
import { useForm, FormProvider } from "react-hook-form"
import { useSelector } from "react-redux"
import { ajvResolver } from "./ajvResolver"

const useStyles = makeStyles(theme => ({
  formComponents: {
    display: "flex",
    flexWrap: "wrap",
    "& .MuiTextField-root": {
      width: "48%",
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
      width: "100%",
    },
    "& .array": {
      margin: theme.spacing(1),
      width: "45%",
      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        width: "100%",
        "& .MuiTextField-root": {
          width: "95%",
        },
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

const FormContent = ({ resolver, formSchema }: { resolver: typeof ajvResolver, formSchema: any }) => {
  const classes = useStyles()
  const methods = useForm({ mode: "onBlur", resolver })
  const onSubmit = data => console.log(JSON.stringify(data, null, 2))
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={classes.formComponents} noValidate>
        {JSONSchemaParser.buildFields(formSchema)}
        <input type="submit" value="Save" />
      </form>
    </FormProvider>
  )
}

const FillObjectDetailsForm = () => {
  const { objectType } = useSelector(state => state.objectType)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formSchema, setFormSchema] = useState({})
  const [validationSchema, setValidationSchema] = useState({})

  useEffect(() => {
    const fetchSchema = async () => {
      const response = await schemaAPIService.getSchemaByObjectType(objectType)
      if (response.ok) {
        setFormSchema(await JSONSchemaParser.dereferenceSchema(response.data))
        console.log("setting validation schema")
        console.log(response.data)
        setValidationSchema(response.data)
      } else {
        setError(checkResponseError(response))
      }
      setIsLoading(false)
    }
    fetchSchema()
  }, [objectType])

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  return <FormContent formSchema={formSchema} resolver={ajvResolver(validationSchema)} />
}

export default FillObjectDetailsForm
