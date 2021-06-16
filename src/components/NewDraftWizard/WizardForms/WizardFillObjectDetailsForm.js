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

import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { resetFocus } from "features/focusSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToFolder, deleteObjectFromFolder, modifyObjectTags } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import { getObjectDisplayTitle, formatDisplayObjectType } from "utils"

const useStyles = makeStyles(theme => ({
  container: {
    margin: 0,
    padding: 0,
  },
  cardHeader: { ...theme.wizard.cardHeader, position: "sticky", top: theme.spacing(8), zIndex: 2 },
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
    "& button": {
      backgroundColor: "#FFF",
    },
  },
  addIcon: {
    marginRight: theme.spacing(1),
  },
  formComponents: {
    margin: theme.spacing(3, 2),
    "& .MuiTextField-root > .Mui-required": {
      color: theme.palette.primary.main,
    },
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
      color: theme.palette.primary.light,
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiTypography-h3": {
      width: "100%",
    },
    "& .array": {
      margin: theme.spacing(1),
      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        width: "100%",
        "& .MuiTextField-root": {
          width: "95%",
        },
      },
      "& h2, h3, h4": {
        margin: theme.spacing(1, 0),
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
  const { objectType, currentObject, refForm, onClickNewForm, onClickClearForm, onClickSaveDraft, onClickSubmit } =
    props

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
        {currentObject?.status === ObjectStatus.draft ? "Update draft" : " Save as Draft"}
      </Button>
      <Button
        variant="contained"
        aria-label="submit form"
        size="small"
        type={currentObject?.status === ObjectStatus.submitted ? "button" : "submit"}
        onClick={onClickSubmit}
        form={refForm}
      >
        {currentObject?.status === ObjectStatus.submitted ? "Update" : "Submit"} {formatDisplayObjectType(objectType)}
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

  const [draftAutoSaveAllowed, setDraftAutoSaveAllowed] = useState(false)

  const autoSaveTimer = useRef(null)
  let timer = 0

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
    resetTimer()
    clearForm()
    setCurrentObjectId(null)
    dispatch(resetCurrentObject())
  }

  const clearForm = () => {
    resetTimer()
    methods.reset({})
    setCleanedValues({})
    dispatch(resetDraftStatus())
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

    if (clone && checkFormCleanedValuesEmpty(values)) {
      Object.keys(values).forEach(item => (clone[item] = values[item]))

      !currentObject.accessionId && currentObjectId
        ? dispatch(
            setCurrentObject({
              ...clone,
              cleanedValues: values,
              status: currentObject.status || ObjectStatus.draft,
              objectId: currentObjectId,
            })
          )
        : dispatch(setCurrentObject({ ...clone, cleanedValues: values }))
      checkDirty()
    } else {
      dispatch(resetDraftStatus())
      resetTimer()
    }
  }

  const handleDraftDelete = draftId => {
    dispatch(deleteObjectFromFolder(ObjectStatus.draft, draftId, objectType))
    setCurrentObjectId(() => null)
    handleChange()
  }

  /*
   * Logic for auto-save feature.
   * We use setDraftAutoSaveAllowed state change to render form before save.
   * This helps with getting current accession ID and form data without rendering on every timer increment.
   */
  const startTimer = () => {
    autoSaveTimer.current = setInterval(() => {
      timer = timer + 1

      if (timer >= 60) {
        setDraftAutoSaveAllowed(true)
      }
    }, 1000)
  }

  const resetTimer = () => {
    setDraftAutoSaveAllowed(false)
    clearInterval(autoSaveTimer.current)
    timer = 0
  }

  useEffect(() => {
    if (alert) resetTimer()

    if (draftAutoSaveAllowed) {
      saveDraft()
      resetTimer()
    }
  }, [draftAutoSaveAllowed, alert])

  const keyHandler = () => {
    resetTimer()
    startTimer()
  }

  useEffect(() => {
    window.addEventListener("keydown", keyHandler)
    return () => {
      resetTimer()
      window.removeEventListener("keydown", keyHandler)
    }
  }, [])

  /*
   * Draft save and object patch use both same response handler
   */
  const patchHandler = (response, cleanedValues) => {
    if (response.ok) {
      dispatch(
        modifyObjectTags({
          accessionId: currentObject.accessionId,
          tags: {
            submissionType: currentObject.tags.submissionType,
            displayTitle: getObjectDisplayTitle(objectType, cleanedValues),
          },
        })
      )
      dispatch(resetDraftStatus())
      dispatch(
        updateStatus({
          successStatus: WizardStatus.success,
          response: response,
          errorPrefix: "",
        })
      )
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
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
    resetTimer()
    if (checkFormCleanedValuesEmpty(cleanedValues)) {
      const handleSave = await saveDraftHook(
        currentObject.accessionId || currentObject.objectId,
        objectType,
        currentObject.status,
        folderId,
        cleanedValues || currentObject.cleanedValues,
        dispatch
      )
      if (handleSave.ok && currentObject?.status !== ObjectStatus.submitted) {
        setCurrentObjectId(handleSave.data.accessionId)
      }
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.info,
          response: "",
          errorPrefix: "An empty form cannot be saved. Please fill in the form before saving it.",
        })
      )
    }
  }

  const patchObject = async () => {
    resetTimer()
    const response = await objectAPIService.patchFromJSON(objectType, currentObjectId, cleanedValues)
    patchHandler(response, cleanedValues)
  }

  const submitForm = () => {
    if (currentObject?.status === ObjectStatus.submitted) patchObject()
    if (currentObject?.status === ObjectStatus.draft && currentObjectId && Object.keys(currentObject).length > 0)
      handleDraftDelete(currentObjectId)

    resetTimer()
  }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        objectType={objectType}
        currentObject={currentObject}
        refForm="hook-form"
        onClickNewForm={() => createNewForm()}
        onClickClearForm={() => clearForm()}
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
const WizardFillObjectDetailsForm = (): React$Element<typeof Container> => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const objectType = useSelector(state => state.objectType)
  const { folderId } = useSelector(state => state.submissionFolder)
  const currentObject = useSelector(state => state.currentObject)

  // States that will update in useEffect()
  const [states, setStates] = useState({
    error: false,
    errorPrefix: "",
    formSchema: {},
    validationSchema: {},
    isLoading: true,
  })

  const [successStatus, setSuccessStatus] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [responseInfo, setResponseInfo] = useState([])

  /*
   * Fetch json schema from either session storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      let schema = sessionStorage.getItem(`cached_${objectType}_schema`)

      if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
        const response = await schemaAPIService.getSchemaByObjectType(objectType)
        if (response.ok) {
          schema = response.data
          sessionStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(schema))
        } else {
          setStates({
            ...states,
            error: true,
            errorPrefix: "Unfortunately an error happened while catching form fields",
            isLoading: false,
          })
          return
        }
      } else {
        schema = JSON.parse(schema)
      }
      setStates({
        ...states,
        formSchema: await JSONSchemaParser.dereferenceSchema(schema),
        validationSchema: schema,
        isLoading: false,
      })
    }
    fetchSchema()
  }, [objectType])

  /*
   * Submit form with cleaned values and check for response errors
   */
  const onSubmit = async data => {
    setSuccessStatus(undefined)
    setSubmitting(true)
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus(WizardStatus.info)
    }, 5000)
    const cleanedValues = JSONSchemaParser.cleanUpFormValues(data)
    const response = await objectAPIService.createFromJSON(objectType, cleanedValues)

    setResponseInfo(response)

    if (response.ok) {
      const objectDisplayTitle = getObjectDisplayTitle(objectType, cleanedValues)

      dispatch(
        addObjectToFolder(folderId, {
          accessionId: response.data.accessionId,
          schema: objectType,
          tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: objectDisplayTitle },
        })
      )
        .then(() => {
          setSuccessStatus(WizardStatus.success)
          dispatch(resetDraftStatus())
          dispatch(resetCurrentObject())
        })
        .catch(error => {
          setSuccessStatus(WizardStatus.error)
          setResponseInfo(error)
          setStates({ ...states, errorPrefix: "Cannot connect to folder API" })
        })
    } else {
      setSuccessStatus(WizardStatus.error)
      setStates({ ...states, errorPrefix: "Validation failed" })
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
  }

  if (states.isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (states.error) return <Alert severity="error">{states.errorPrefix}</Alert>

  return (
    <Container maxWidth={false} className={classes.container}>
      <FormContent
        formSchema={states.formSchema}
        resolver={WizardAjvResolver(states.validationSchema)}
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
          prefixText={states.errorPrefix}
        ></WizardStatusMessageHandler>
      )}
    </Container>
  )
}

export default WizardFillObjectDetailsForm
