//@flow
import React, { useEffect, useState, useRef } from "react"

import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import Container from "@material-ui/core/Container"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import Alert from "@material-ui/lab/Alert"
import Ajv from "ajv"
import { useForm, FormProvider } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { setDraftObject } from "features/wizardDraftObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToFolder, addObjectToDrafts } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"

const useStyles = makeStyles(theme => ({
  formComponents: {
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
  formButtonContainer: {
    display: "flex",
    flexDirection: "row",
  },
  formButtonSave: {
    margin: theme.spacing(2, "auto", 2, 1),
    marginRight: "auto",
  },
  formButtonClear: {
    margin: theme.spacing(2, 1, 2, "auto"),
  },
  formButtonSubmit: {
    margin: theme.spacing(2, 1, 2, 1),
  },
}))

type FormContentProps = {
  resolver: typeof WizardAjvResolver,
  formSchema: any,
  onSubmit: () => Promise<any>,
  objectType: string,
  folderId: string,
}

/*
 * Return react-hook-form based form which is rendered from schema and checked against resolver
 */
const FormContent = ({ resolver, formSchema, onSubmit, objectType, folderId }: FormContentProps) => {
  const classes = useStyles()
  const methods = useForm({ mode: "onBlur", resolver })
  const draftStatus = useSelector(state => state.draftStatus)
  const dispatch = useDispatch()
  const [cleanedValues, setCleanedValues] = useState({})
  const [timer, setTimer] = useState(0)
  const increment = useRef(null)
  const alert = useSelector(state => state.alert)

  const resetForm = () => {
    methods.reset()
  }

  useEffect(() => {
    methods.formState.isDirty ? dispatch(setDraftStatus("notSaved")) : dispatch(resetDraftStatus())
  }, [methods.formState.isDirty])

  const handleChange = () => {
    setCleanedValues(JSONSchemaParser.cleanUpFormValues(methods.getValues()))
    dispatch(setDraftObject(cleanedValues))

    if (methods.formState.isDirty && draftStatus === "") {
      dispatch(setDraftStatus("notSaved"))
    }
  }

  /*
   * Logic for auto-save feature
   */
  const handleStart = () => {
    increment.current = setInterval(() => {
      setTimer(timer => timer + 1)
    }, 1000)
  }

  const handleReset = () => {
    clearInterval(increment.current)
    setTimer(0)
  }

  const keyHandler = () => {
    handleReset()
    handleStart()
  }

  useEffect(() => {
    window.addEventListener("keydown", keyHandler)
    return () => {
      window.removeEventListener("keydown", keyHandler)
    }
  }, [])

  const saveDraft = async () => {
    const response = await draftAPIService.createFromJSON(objectType, cleanedValues)
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        addObjectToDrafts(folderId, {
          accessionId: response.data.accessionId,
          schema: objectType,
        })
      )
        .then(() => {
          dispatch(
            updateStatus({
              successStatus: "success",
              response: response,
              errorPrefix: "",
            })
          )
        })
        .catch(error => {
          dispatch(
            updateStatus({
              successStatus: "error",
              response: error,
              errorPrefix: "Cannot connect to folder API",
            })
          )
        })
    }
  }

  useEffect(() => {
    if (alert) {
      clearInterval(increment.current)
    }
    if (timer >= 60) {
      saveDraft()
      clearInterval(increment.current)
    }
  }, [timer])

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={classes.formComponents}
        onChange={() => handleChange()}
      >
        <div>{JSONSchemaParser.buildFields(formSchema)}</div>
        <div className={classes.formButtonContainer}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={classes.formButtonSave}
            onClick={() => saveDraft()}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className={classes.formButtonClear}
            onClick={() => resetForm()}
          >
            Clear form
          </Button>
          <Button variant="contained" color="primary" size="small" type="submit" className={classes.formButtonSubmit}>
            Submit {objectType}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/*
 * Container for json schema based form. Handles json schema loading, form rendering, form submitting and error/success alerts.
 */
const WizardFillObjectDetailsForm = () => {
  const objectType = useSelector(state => state.objectType)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorPrefix, setErrorPrefix] = useState("")
  const [successStatus, setSuccessStatus] = useState("")
  const [formSchema, setFormSchema] = useState({})
  const [validationSchema, setValidationSchema] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useDispatch()
  const { id: folderId } = useSelector(state => state.submissionFolder)
  const [responseInfo, setResponseInfo] = useState([])

  /*
   * Submit form with cleaned values and check for response errors
   */
  const onSubmit = async data => {
    setSuccessStatus(undefined)
    setSubmitting(true)
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus("info")
    }, 5000)
    const cleanedValues = JSONSchemaParser.cleanUpFormValues(data)
    const response = await objectAPIService.createFromJSON(objectType, cleanedValues)

    setResponseInfo(response)

    if (response.ok) {
      dispatch(
        addObjectToFolder(folderId, {
          accessionId: response.data.accessionId,
          schema: objectType,
        })
      )
        .then(() => setSuccessStatus("success"))
        .catch(error => {
          setSuccessStatus("error")
          setResponseInfo(error)
          setErrorPrefix("Cannot connect to folder API")
        })
    } else {
      setSuccessStatus("error")
      setErrorPrefix("Validation failed")
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
    dispatch(resetDraftStatus())
  }

  /*
   * Fetch json schema from either local storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      let schema = localStorage.getItem(`cached_${objectType}_schema`)
      if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
        const response = await schemaAPIService.getSchemaByObjectType(objectType)
        setResponseInfo(response)
        if (response.ok) {
          schema = response.data
          localStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(schema))
        } else {
          setError(true)
          setErrorPrefix("Unfortunately an error happened while catching form fields")
          setIsLoading(false)
          return
        }
      } else {
        schema = JSON.parse(schema)
      }
      setFormSchema(await JSONSchemaParser.dereferenceSchema(schema))
      setValidationSchema(schema)
      setIsLoading(false)
    }
    fetchSchema()
  }, [objectType])

  if (isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (error) return <Alert severity="error">{errorPrefix}</Alert>

  return (
    <Container maxWidth="md">
      <FormContent
        formSchema={formSchema}
        resolver={WizardAjvResolver(validationSchema)}
        onSubmit={onSubmit}
        objectType={objectType}
        folderId={folderId}
      />
      {submitting && <LinearProgress />}
      {successStatus && (
        <WizardStatusMessageHandler
          successStatus={successStatus}
          response={responseInfo}
          prefixText={errorPrefix}
        ></WizardStatusMessageHandler>
      )}
    </Container>
  )
}

export default WizardFillObjectDetailsForm
