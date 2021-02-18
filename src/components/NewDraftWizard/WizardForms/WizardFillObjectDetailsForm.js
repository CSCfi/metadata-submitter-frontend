//@flow
import React, { useEffect, useState, useRef } from "react"

import Button from "@material-ui/core/Button"
import CardHeader from "@material-ui/core/CardHeader"
import CircularProgress from "@material-ui/core/CircularProgress"
import Container from "@material-ui/core/Container"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import AddCircleOutlinedIcon from "@material-ui/icons/AddCircleOutlined"
import Alert from "@material-ui/lab/Alert"
import Ajv from "ajv"
import { cloneDeep } from "lodash"
import { useForm, FormProvider } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { ObjectSubmissionTypes } from "constants/object"
import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { resetFocus } from "features/focusSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToFolder, addObjectToDrafts, deleteObjectFromFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"

const useStyles = makeStyles(theme => ({
  container: {
    margin: 0,
    padding: 0,
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: "#FFF",
    fontWeight: "bold",
    position: "sticky",
    top: theme.spacing(8),
    zIndex: 2,
  },
  cardHeaderAction: {
    marginTop: "-4px",
    marginBottom: "-4px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "row",
    "& > :not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  addIcon: {
    marginRight: theme.spacing(1),
  },
  formComponents: {
    margin: theme.spacing(3, 2),
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

type CustomCardHeaderProps = {
  objectType: string,
  currentObject: any,
  onClickNewForm: () => void,
  onClickClearForm: () => void,
  onClickSaveDraft: () => Promise<void>,
  onClickSubmit: () => void,
  refForm: any,
}

type FormContentProps = {
  resolver: typeof WizardAjvResolver,
  formSchema: any,
  onSubmit: () => Promise<any>,
  objectType: string,
  folderId: string,
  currentObject: any,
}

/*
 * Create header for form card with button to close the card
 */
const CustomCardHeader = (props: CustomCardHeaderProps) => {
  const classes = useStyles()
  const {
    objectType,
    currentObject,
    refForm,
    onClickNewForm,
    onClickClearForm,
    onClickSaveDraft,
    onClickSubmit,
  } = props

  const dispatch = useDispatch()

  const focusTarget = useRef(null)
  const shouldFocus = useSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const handleClick = () => {
    onClickNewForm()
    dispatch(resetFocus())
  }

  const buttonGroup = (
    <div className={classes.buttonGroup}>
      <Button
        ref={focusTarget}
        variant="contained"
        aria-label="create new form"
        size="small"
        onClick={() => handleClick()}
        onBlur={() => dispatch(resetFocus())}
      >
        <AddCircleOutlinedIcon fontSize="small" className={classes.addIcon} />
        New form
      </Button>
      <Button variant="contained" aria-label="clear form" size="small" onClick={onClickClearForm}>
        Clear form
      </Button>
      <Button variant="contained" aria-label="save form as draft" size="small" onClick={onClickSaveDraft}>
        Save as Draft
      </Button>
      <Button
        variant="contained"
        aria-label="submit form"
        size="small"
        type={currentObject?.type === "saved" ? "button" : "submit"}
        onClick={onClickSubmit}
        form={refForm}
      >
        {currentObject?.type === "saved" ? "Update" : "Submit"} {objectType}
      </Button>
    </div>
  )

  return (
    <CardHeader
      title="Fill form"
      titleTypographyProps={{ variant: "inherit" }}
      classes={{
        root: classes.cardHeader,
        action: classes.cardHeaderAction,
      }}
      action={buttonGroup}
    />
  )
}

/*
 * Return react-hook-form based form which is rendered from schema and checked against resolver. Set default values when continuing draft
 */
const FormContent = ({ resolver, formSchema, onSubmit, objectType, folderId, currentObject }: FormContentProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const draftStatus = useSelector(state => state.draftStatus)
  const alert = useSelector(state => state.alert)

  const methods = useForm({ mode: "onBlur", resolver })

  const [cleanedValues, setCleanedValues] = useState({})
  const [currentObjectId, setCurrentObjectId] = useState(currentObject?.accessionId)

  const [timer, setTimer] = useState(0)

  const increment = useRef(null)

  // Set form default values
  useEffect(() => {
    methods.reset(currentObject)
    setCleanedValues(currentObject)
  }, [currentObject?.accessionId])

  // Check if form has been edited
  useEffect(() => {
    checkDirty()
  }, [methods.formState.isDirty])

  const createNewForm = () => {
    handleReset()
    resetForm()
    setCurrentObjectId(null)
    dispatch(resetDraftStatus())
    dispatch(resetCurrentObject())
  }

  const resetForm = () => {
    methods.reset(formSchema)
    setCleanedValues({})
    dispatch(resetDraftStatus())
    handleReset()
  }

  // Check if the form is empty
  const checkFormCleanedValuesEmpty = (cleanedValues: any) => {
    return Object.keys(cleanedValues).length > 0
  }

  const checkDirty = () => {
    if (methods.formState.isDirty && draftStatus === "" && checkFormCleanedValuesEmpty(cleanedValues)) {
      dispatch(setDraftStatus("notSaved"))
    }
  }

  // Draft data is set to state on every change to form
  const handleChange = () => {
    const clone = cloneDeep(currentObject)
    const values = JSONSchemaParser.cleanUpFormValues(methods.getValues())
    setCleanedValues(values)

    if (checkFormCleanedValuesEmpty(values)) {
      Object.keys(values).forEach(item => (clone[item] = values[item]))

      !currentObject.accessionId && currentObjectId
        ? dispatch(
            setCurrentObject({
              ...clone,
              cleanedValues: values,
              type: currentObject.type || "draft",
              objectId: currentObjectId,
            })
          )
        : dispatch(setCurrentObject({ ...clone, cleanedValues: values }))
      checkDirty()
    } else {
      dispatch(resetDraftStatus())
      handleReset()
    }
  }

  const handleDraftDelete = draftId => {
    dispatch(deleteObjectFromFolder("draft", draftId, objectType))
    setCurrentObjectId(() => null)
    handleChange()
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
      handleReset()
      window.removeEventListener("keydown", keyHandler)
    }
  }, [])

  // Form actions
  const patchHandler = response => {
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        updateStatus({
          successStatus: "success",
          response: response,
          errorPrefix: "",
        })
      )
    } else {
      dispatch(
        updateStatus({
          successStatus: "error",
          response: response,
          errorPrefix: "Unexpected error",
        })
      )
    }
  }

  /*
   * Update or save new draft depending on object status
   */
  const saveDraft = async () => {
    handleReset()
    if (checkFormCleanedValuesEmpty(cleanedValues)) {
      if ((currentObjectId || currentObject?.accessionId) && currentObject?.type === "draft") {
        const response = await draftAPIService.patchFromJSON(objectType, currentObjectId, cleanedValues)
        patchHandler(response)
      } else {
        const response = await draftAPIService.createFromJSON(objectType, cleanedValues)
        if (response.ok) {
          if (currentObject?.type !== "saved") setCurrentObjectId(response.data.accessionId)
          dispatch(resetDraftStatus())
          dispatch(
            addObjectToDrafts(folderId, {
              accessionId: response.data.accessionId,
              schema: "draft-" + objectType,
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
        } else {
          dispatch(
            updateStatus({
              successStatus: "error",
              response: response,
              errorPrefix: "Unexpected error",
            })
          )
        }
      }
    } else {
      dispatch(
        updateStatus({
          successStatus: "info",
          response: "",
          errorPrefix: "An empty form cannot be saved. Please fill in the form before saving it.",
        })
      )
    }
  }

  const patchObject = async () => {
    handleReset()
    const response = await objectAPIService.patchFromJSON(objectType, currentObjectId, cleanedValues)
    patchHandler(response)
  }

  // Clear auto-save timer
  useEffect(() => {
    if (alert) {
      clearInterval(increment.current)
    }
    if (timer >= 60) {
      saveDraft()
      clearInterval(increment.current)
    }
  }, [timer])

  const submitForm = () => {
    if (currentObject?.type === "saved") patchObject()
    if (currentObject?.type === "draft" && currentObjectId && Object.keys(currentObject).length > 0)
      handleDraftDelete(currentObjectId)

    handleReset()
  }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        objectType={objectType}
        currentObject={currentObject}
        refForm="hook-form"
        onClickNewForm={() => createNewForm()}
        onClickClearForm={() => resetForm()}
        onClickSaveDraft={() => saveDraft()}
        onClickSubmit={() => submitForm()}
      />
      <form
        id="hook-form"
        className={classes.formComponents}
        onChange={() => handleChange()}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div>{JSONSchemaParser.buildFields(formSchema)}</div>
      </form>
    </FormProvider>
  )
}

/*
 * Container for json schema based form. Handles json schema loading, form rendering, form submitting and error/success alerts.
 */
const WizardFillObjectDetailsForm = () => {
  const classes = useStyles()

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
  const currentObject = useSelector(state => state.currentObject)

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
          tags: { submissionType: ObjectSubmissionTypes.form },
        })
      )
        .then(() => {
          setSuccessStatus("success")
          dispatch(resetDraftStatus())
          dispatch(resetCurrentObject())
        })
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
  }

  /*
   * Fetch json schema from either local storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      let schema = sessionStorage.getItem(`cached_${objectType}_schema`)
      if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
        const response = await schemaAPIService.getSchemaByObjectType(objectType)
        setResponseInfo(response)
        if (response.ok) {
          schema = response.data
          sessionStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(schema))
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
    <Container className={classes.container}>
      <FormContent
        formSchema={formSchema}
        resolver={WizardAjvResolver(validationSchema)}
        onSubmit={onSubmit}
        objectType={objectType}
        folderId={folderId}
        currentObject={currentObject}
        key={currentObject?.accessionId || folderId}
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
