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
import { cloneDeep, set } from "lodash"
import { useForm, FormProvider } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import getLinkedDereferencedSchema from "../WizardHooks/WizardLinkedDereferencedSchemaHook"
import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"
import submitObjectHook from "../WizardHooks/WizardSubmitObjectHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import { setClearForm } from "features/clearFormSlice"
import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { setFileTypes } from "features/fileTypesSlice"
import { resetFocus } from "features/focusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { deleteObjectFromFolder, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import type { FolderDetailsWithId } from "types"
import { getObjectDisplayTitle, formatDisplayObjectType, getAccessionIds, getNewUniqueFileTypes } from "utils"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

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
  formComponents: theme.form,
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
  folder: FolderDetailsWithId,
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
const FormContent = ({ resolver, formSchema, onSubmit, objectType, folder, currentObject }: FormContentProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const draftStatus = useSelector(state => state.draftStatus)
  const alert = useSelector(state => state.alert)
  const clearForm = useSelector(state => state.clearForm)

  const methods = useForm({ mode: "onBlur", resolver })

  const [currentObjectId, setCurrentObjectId] = useState(currentObject?.accessionId)
  const [draftAutoSaveAllowed, setDraftAutoSaveAllowed] = useState(false)

  const autoSaveTimer = useRef(null)
  let timer = 0

  // Set form default values
  useEffect(() => {
    methods.reset(currentObject)
  }, [currentObject?.accessionId])

  useEffect(() => {
    dispatch(setClearForm(false))
  }, [clearForm])

  // Check if form has been edited
  useEffect(() => {
    checkDirty()
  }, [methods.formState.isDirty])

  const { isSubmitSuccessful } = methods.formState // Check if the form has been successfully submitted without any errors

  useEffect(() => {
    // Delete draft form ONLY if the form was successfully submitted
    if (isSubmitSuccessful) {
      if (currentObject?.status === ObjectStatus.draft && currentObjectId && Object.keys(currentObject).length > 0)
        handleDraftDelete(currentObjectId)
    }
  }, [isSubmitSuccessful])

  const handleCreateNewForm = () => {
    resetTimer()
    handleClearForm()
    setCurrentObjectId(null)
    dispatch(resetCurrentObject())
  }

  const handleClearForm = () => {
    resetTimer()
    methods.reset({})
    dispatch(setClearForm(true))
    dispatch(resetDraftStatus())
  }

  // Check if the form is empty
  const checkFormCleanedValuesEmpty = (cleanedValues: any) => {
    return Object.keys(cleanedValues).length > 0
  }

  const checkDirty = () => {
    if (methods.formState.isDirty && draftStatus === "" && checkFormCleanedValuesEmpty(getCleanedValues())) {
      dispatch(setDraftStatus("notSaved"))
    }
  }

  const getCleanedValues = () => JSONSchemaParser.cleanUpFormValues(methods.getValues())

  // Draft data is set to state on every change to form
  const handleChange = () => {
    clearForm ? dispatch(setClearForm(false)) : null
    const clone = cloneDeep(currentObject)
    const values = JSONSchemaParser.cleanUpFormValues(methods.getValues())

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
      handleSaveDraft()
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
      const index = folder.metadataObjects.findIndex(item => item.accessionId === currentObject.accessionId)
      dispatch(
        replaceObjectInFolder(
          folder.folderId,
          currentObject.accessionId,
          index,
          {
            submissionType: ObjectSubmissionTypes.form,
            displayTitle: getObjectDisplayTitle(objectType, cleanedValues),
          },
          ObjectStatus.submitted
        )
      )
      dispatch(resetDraftStatus())
      dispatch(
        updateStatus({
          status: ResponseStatus.success,
          response: response,
          helperText: "",
        })
      )
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Unexpected error",
        })
      )
    }
  }

  /*
   * Update or save new draft depending on object status
   */
  const handleSaveDraft = async () => {
    resetTimer()
    const cleanedValues = getCleanedValues()

    if (checkFormCleanedValuesEmpty(cleanedValues)) {
      const handleSave = await saveDraftHook(
        currentObject.accessionId || currentObject.objectId,
        objectType,
        currentObject.status,
        folder,
        cleanedValues,
        dispatch
      )
      if (handleSave.ok && currentObject?.status !== ObjectStatus.submitted) {
        setCurrentObjectId(handleSave.data.accessionId)
      }
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.info,
          response: "",
          helperText: "An empty form cannot be saved. Please fill in the form before saving it.",
        })
      )
    }
  }

  const patchObject = async () => {
    resetTimer()
    const cleanedValues = getCleanedValues()
    try {
      const response = await objectAPIService.patchFromJSON(objectType, currentObjectId, cleanedValues)
      patchHandler(response, cleanedValues)

      // Dispatch fileTypes if object is Run or Analysis
      if (objectType === ObjectTypes.run || objectType === ObjectTypes.analysis) {
        const objectWithFileTypes = getNewUniqueFileTypes(currentObjectId, cleanedValues)
        objectWithFileTypes ? dispatch(setFileTypes(objectWithFileTypes)) : null
      }
    } catch (err) {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: err,
          errorPrefix: "Unexpected error when modifying object",
        })
      )
    }
  }

  const handleSubmitForm = () => {
    if (currentObject?.status === ObjectStatus.submitted) patchObject()
    resetTimer()
  }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        objectType={objectType}
        currentObject={currentObject}
        refForm="hook-form"
        onClickNewForm={() => handleCreateNewForm()}
        onClickClearForm={() => handleClearForm()}
        onClickSaveDraft={() => handleSaveDraft()}
        onClickSubmit={() => handleSubmitForm()}
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
  const folder = useSelector(state => state.submissionFolder)
  const currentObject = useSelector(state => state.currentObject)

  // States that will update in useEffect()
  const [states, setStates] = useState({
    error: false,
    helperText: "",
    formSchema: {},
    validationSchema: {},
    isLoading: true,
  })
  const [submitting, setSubmitting] = useState(false)

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
            helperText: "Unfortunately an error happened while catching form fields",
            isLoading: false,
          })
          return
        }
      } else {
        schema = JSON.parse(schema)
      }

      // Dereference Schema and link AccessionIds to equivalent objects
      let dereferencedSchema: Promise<any> = await dereferenceSchema(schema)
      dereferencedSchema = getLinkedDereferencedSchema(
        currentObject,
        schema.title.toLowerCase(),
        dereferencedSchema,
        folder.metadataObjects,
        analysisAccessionIds
      )

      setStates({
        ...states,
        formSchema: dereferencedSchema,
        validationSchema: schema,
        isLoading: false,
      })
    }
    fetchSchema()
  }, [objectType])

  // All Analysis AccessionIds
  const analysisAccessionIds = getAccessionIds(ObjectTypes.analysis, folder.metadataObjects)

  useEffect(() => {
    if (ObjectTypes.analysis) {
      if (analysisAccessionIds?.length > 0) {
        // Link other Analysis AccessionIds to current Analysis form
        setStates(prevState => {
          return set(
            prevState,
            `formSchema.properties.analysisRef.items.properties.accessionId.enum`,
            analysisAccessionIds.filter(id => id !== currentObject?.accessionId)
          )
        })
      }
    }
  }, [currentObject?.accessionId, analysisAccessionIds?.length])

  /*
   * Submit form with cleaned values and check for response errors
   */
  const onSubmit = async data => {
    setSubmitting(true)
    const response = await submitObjectHook(data, folder.folderId, objectType, dispatch)

    if (response) setSubmitting(false)
  }

  if (states.isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (states.error) return <Alert severity="error">{states.helperText}</Alert>

  return (
    <Container maxWidth={false} className={classes.container}>
      <FormContent
        formSchema={states.formSchema}
        resolver={WizardAjvResolver(states.validationSchema)}
        onSubmit={onSubmit}
        objectType={objectType}
        folder={folder}
        currentObject={currentObject}
        key={currentObject?.accessionId || folder.folderId}
      />
      {submitting && <LinearProgress />}
    </Container>
  )
}

export default WizardFillObjectDetailsForm
