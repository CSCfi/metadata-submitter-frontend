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
import objectAPIService from "services/objectAPI"
import Button from "@material-ui/core/Button"
import LinearProgress from "@material-ui/core/LinearProgress"

const useStyles = makeStyles(theme => ({
  formComponents: {
    display: "flex",
    flexWrap: "wrap",
    minWidth: "60vw",
    flexDirection: "column",
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
  formButton: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

const checkResponseError = (response, prefixText) => {
  switch (response.status) {
    case 504:
      return `Unfortunately we couldn't connect to our server.`
    case 400:
      return `${prefixText}, details: ${response.data.detail}`
    default:
      return "Unfortunately an unexpected error happened on our servers"
  }
}

type FormContentProps = {
  resolver: typeof ajvResolver,
  formSchema: any,
  onSubmit: () => Promise<any>,
}

const FormContent = ({ resolver, formSchema, onSubmit }: FormContentProps) => {
  const classes = useStyles()
  const methods = useForm({ mode: "onBlur", resolver })
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={classes.formComponents}>
        <div>{JSONSchemaParser.buildFields(formSchema)}</div>
        <div>
          <Button variant="contained" color="primary" size="small" type="submit" className={classes.formButton}>
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const FillObjectDetailsForm = () => {
  const { objectType } = useSelector(state => state.objectType)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [successStatus, setSuccessStatus] = useState("info")
  const [formSchema, setFormSchema] = useState({})
  const [validationSchema, setValidationSchema] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async data => {
    setSubmitting(true)
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus("info")
      setSuccessMessage(`For some reason, your file is still being saved
                to our database, please wait. If saving doesn't go through in two
                minutes, please try saving the file again.`)
    }, 5000)
    const clearedData = JSONSchemaParser.clearEmptyValues(data)

    const response = await objectAPIService.createFromJSON(objectType, clearedData)

    if (response.ok) {
      setSuccessStatus("success")
      setSuccessMessage(`Submitted with accessionid ${response.data.accessionId}`)
    } else {
      setSuccessStatus("error")
      setSuccessMessage(checkResponseError(response, "Validation failed"))
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
  }

  useEffect(() => {
    const fetchSchema = async () => {
      const response = await schemaAPIService.getSchemaByObjectType(objectType)
      if (response.ok) {
        setFormSchema(await JSONSchemaParser.dereferenceSchema(response.data))
        setValidationSchema(response.data)
      } else {
        setError(checkResponseError(response, "Unfortunately an error happened while catching form fields"))
      }
      setIsLoading(false)
    }
    fetchSchema()
  }, [objectType])

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  return (
    <div>
      <FormContent formSchema={formSchema} resolver={ajvResolver(validationSchema)} onSubmit={onSubmit} />
      {submitting && <LinearProgress />}
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
