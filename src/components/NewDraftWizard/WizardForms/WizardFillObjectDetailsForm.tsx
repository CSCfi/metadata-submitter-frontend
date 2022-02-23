import React, { useEffect, useState, useRef } from "react"

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined"
import { CustomTheme } from "@mui/material"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import CardHeader from "@mui/material/CardHeader"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import LinearProgress from "@mui/material/LinearProgress"
import { makeStyles } from "@mui/styles"
import Ajv from "ajv"
import { ApiResponse } from "apisauce"
import { cloneDeep, set } from "lodash"
import { useForm, FormProvider, FieldValues, Resolver, SubmitHandler } from "react-hook-form"

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
import { replaceTemplate } from "features/userSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { deleteObjectFromFolder, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import templateAPI from "services/templateAPI"
import type { FolderDetailsWithId, FormDataFiles, FormObject, ObjectDetails, ObjectDisplayValues } from "types"
import { getObjectDisplayTitle, formatDisplayObjectType, getAccessionIds, getNewUniqueFileTypes } from "utils"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles((theme: CustomTheme) => ({
  container: {
    margin: 0,
    padding: 0,
  },
  cardHeader: { ...theme.wizard.cardHeader, position: "sticky", top: 8, zIndex: 2 },
  resetTopMargin: { top: "0 !important" },
  cardHeaderAction: {
    marginTop: "-4px",
    marginBottom: "-4px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "row",
    "& > :not(:last-child)": {
      marginRight: 1,
    },
    "& button": {
      backgroundColor: "#FFF",
      color: theme.palette.primary.main,
    },
  },
  addIcon: {
    marginRight: 1,
  },
  formComponents: { ...theme.form },
}))

type CustomCardHeaderProps = {
  objectType: string
  currentObject: ObjectDetails
  onClickNewForm: () => void
  onClickClearForm: () => void
  onClickSaveDraft: () => Promise<void>
  onClickUpdateTemplate: () => Promise<void>
  onClickSubmit: () => void
  onClickCloseDialog: () => void
  refForm: string
}

type FormContentProps = {
  resolver: Resolver<FieldValues, Record<string, unknown>>
  formSchema: FormObject
  onSubmit: SubmitHandler<FieldValues>
  objectType: string
  folder: FolderDetailsWithId
  currentObject: ObjectDetails & { objectId: string; [key: string]: unknown }
  closeDialog: () => void
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
    onClickUpdateTemplate,
    onClickSubmit,
    onClickCloseDialog,
  } = props

  const dispatch = useAppDispatch()

  const focusTarget = useRef<HTMLButtonElement>(null)
  const shouldFocus = useAppSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const handleClick = () => {
    onClickNewForm()
    dispatch(resetFocus())
  }

  const templateButtonGroup = (
    <div className={classes.buttonGroup}>
      <Button
        type="submit"
        variant="contained"
        aria-label="save form as draft"
        size="small"
        onClick={onClickUpdateTemplate}
      >
        Update template
      </Button>
      <Button variant="contained" aria-label="clear form" size="small" onClick={onClickCloseDialog}>
        Close
      </Button>
    </div>
  )

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
        type="submit"
        onClick={onClickSubmit}
        form={refForm}
      >
        {currentObject?.status === ObjectStatus.submitted ? "Update" : "Submit"} {formatDisplayObjectType(objectType)}
      </Button>
    </div>
  )

  //

  return (
    <CardHeader
      title="Fill form"
      titleTypographyProps={{ variant: "inherit" }}
      classes={{
        root: classes.cardHeader,
        action: classes.cardHeaderAction,
      }}
      className={currentObject?.status === ObjectStatus.template ? classes.resetTopMargin : ""}
      action={currentObject?.status === ObjectStatus.template ? templateButtonGroup : buttonGroup}
    />
  )
}

/*
 * Draft save and object patch use both same response handler
 */
const patchHandler = (
  response: ApiResponse<unknown>,
  folder: FolderDetailsWithId,
  accessionId: string,
  objectType: string,
  cleanedValues: Record<string, unknown>,
  dispatch: (reducer: unknown) => void
) => {
  if (response.ok) {
    dispatch(
      replaceObjectInFolder(
        accessionId,

        {
          submissionType: ObjectSubmissionTypes.form,
          displayTitle: getObjectDisplayTitle(objectType, cleanedValues as ObjectDisplayValues),
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
 * Return react-hook-form based form which is rendered from schema and checked against resolver. Set default values when continuing draft
 */
const FormContent = ({
  resolver,
  formSchema,
  onSubmit,
  objectType,
  folder,
  currentObject,
  closeDialog,
}: FormContentProps) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const draftStatus = useAppSelector(state => state.draftStatus)
  const alert = useAppSelector(state => state.alert)
  const clearForm = useAppSelector(state => state.clearForm)
  const user = useAppSelector(state => state.user)

  const methods = useForm({ mode: "onBlur", resolver })

  const [currentObjectId, setCurrentObjectId] = useState<string | null>(currentObject?.accessionId)
  const [draftAutoSaveAllowed, setDraftAutoSaveAllowed] = useState(false)

  const autoSaveTimer: { current: NodeJS.Timeout | null } = useRef(null)
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
    methods.reset({ undefined })
    dispatch(setClearForm(true))
    dispatch(resetDraftStatus())
  }

  // Check if the form is empty
  const checkFormCleanedValuesEmpty = (cleanedValues: {
    [x: string]: unknown
    [x: number]: unknown
    accessionId?: string
    lastModified?: string
    objectType?: string
    status?: string
    title?: string
    submissionType?: string
  }) => {
    return Object.keys(cleanedValues).length > 0
  }

  const checkDirty = () => {
    if (methods.formState.isDirty && draftStatus === "" && checkFormCleanedValuesEmpty(getCleanedValues())) {
      dispatch(setDraftStatus("notSaved"))
    }
  }

  const getCleanedValues = () => JSONSchemaParser.cleanUpFormValues(methods.getValues()) as ObjectDetails

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

  const handleDraftDelete = (draftId: string) => {
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
    clearInterval(autoSaveTimer.current as NodeJS.Timeout)
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

    // Prevent auto save from template dialog
    if (currentObject?.status !== ObjectStatus.template) startTimer()
  }

  useEffect(() => {
    window.addEventListener("keydown", keyHandler)
    return () => {
      resetTimer()
      window.removeEventListener("keydown", keyHandler)
    }
  }, [])

  const emptyFormError = () => {
    dispatch(
      updateStatus({
        status: ResponseStatus.info,
        helperText: "An empty form cannot be saved. Please fill in the form before saving it.",
      })
    )
  }

  const handleSaveTemplate = async () => {
    const cleanedValues = getCleanedValues()

    if (checkFormCleanedValuesEmpty(cleanedValues)) {
      const response = await templateAPI.patchTemplateFromJSON(objectType, currentObject.accessionId, cleanedValues)

      const templates = user.templates
      const index = templates.findIndex(
        (item: { accessionId: string }) => item.accessionId === currentObject.accessionId
      )
      const displayTitle = getObjectDisplayTitle(objectType, cleanedValues as unknown as ObjectDisplayValues)

      if (response.ok) {
        closeDialog()
        dispatch(replaceTemplate(index, displayTitle, currentObject.accessionId))
          .then(() =>
            dispatch(
              updateStatus({
                status: ResponseStatus.success,
                response: response,
                helperText: "",
              })
            )
          )
          .catch(error => {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: error,
                helperText: "Cannot replace template",
              })
            )
          })
      } else {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: response,
            helperText: "Cannot save template",
          })
        )
      }
    } else {
      emptyFormError()
    }
  }

  /*
   * Update or save new draft depending on object status
   */
  const handleSaveDraft = async () => {
    resetTimer()
    const cleanedValues = getCleanedValues()

    if (checkFormCleanedValuesEmpty(cleanedValues)) {
      const handleSave = await saveDraftHook({
        accessionId: currentObject.accessionId || currentObject.objectId,
        objectType: objectType,
        objectStatus: currentObject.status,
        folder: folder,
        values: cleanedValues,
        dispatch: dispatch,
      })
      if (handleSave.ok && currentObject?.status !== ObjectStatus.submitted) {
        setCurrentObjectId(handleSave.data.accessionId)
      }
    } else {
      emptyFormError()
    }
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
        onClickUpdateTemplate={() => handleSaveTemplate()}
        onClickSubmit={() => resetTimer()}
        onClickCloseDialog={() => closeDialog()}
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
const WizardFillObjectDetailsForm = (props: { closeDialog?: () => void }) => {
  const { closeDialog } = props
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const objectType = useAppSelector(state => state.objectType)
  const folder = useAppSelector(state => state.submissionFolder)
  const currentObject = useAppSelector(state => state.currentObject)
  const locale = useAppSelector(state => state.locale)

  // States that will update in useEffect()
  const [states, setStates] = useState({
    error: false,
    helperText: "",
    formSchema: {},
    validationSchema: {} as FormObject,
    isLoading: true,
  })
  const [submitting, setSubmitting] = useState(false)

  /*
   * Fetch json schema from either session storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      const schema: string | null = sessionStorage.getItem(`cached_${objectType}_schema`)
      let parsedSchema: FormObject

      if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
        const response = await schemaAPIService.getSchemaByObjectType(objectType)
        if (response.ok) {
          parsedSchema = response.data
          sessionStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(parsedSchema))
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
        parsedSchema = JSON.parse(schema)
      }

      // Dereference Schema and link AccessionIds to equivalent objects
      let dereferencedSchema: Promise<FormObject> = await dereferenceSchema(parsedSchema as FormObject)

      dereferencedSchema = getLinkedDereferencedSchema(
        currentObject,
        parsedSchema.title.toLowerCase(),
        dereferencedSchema,
        folder.metadataObjects,
        analysisAccessionIds
      )

      setStates({
        ...states,
        formSchema: dereferencedSchema,
        validationSchema: parsedSchema,
        isLoading: false,
      })
    }

    if (objectType.length) fetchSchema()

    // Reset current object in state on unmount
    return () => {
      dispatch(resetCurrentObject())
      dispatch(resetDraftStatus())
    }
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
  const onSubmit = (data: Record<string, unknown>) => {
    setSubmitting(true)

    // Handle submitted object update
    const patchObject = async () => {
      const accessionId = data.accessionId as string
      const cleanedValues = JSONSchemaParser.cleanUpFormValues(data)
      try {
        const response = await objectAPIService.patchFromJSON(objectType, accessionId, cleanedValues)
        patchHandler(response, folder, currentObject.accessionId, objectType, cleanedValues, dispatch)

        // Dispatch fileTypes if object is Run or Analysis
        if (objectType === ObjectTypes.run || objectType === ObjectTypes.analysis) {
          const objectWithFileTypes = getNewUniqueFileTypes(accessionId, cleanedValues as FormDataFiles)
          objectWithFileTypes ? dispatch(setFileTypes(objectWithFileTypes)) : null
        }
      } catch (error) {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "Unexpected error when modifying object",
          })
        )
      }

      setSubmitting(false)
    }

    // Either patch object or submit a new object
    if (data.status === ObjectStatus.submitted) {
      patchObject()
    } else {
      submitObjectHook(data, folder.folderId, objectType, dispatch)
        .then(() => {
          setSubmitting(false)
        })
        .catch(err => console.error(err))
    }
  }

  if (states.isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (states.error) return <Alert severity="error">{states.helperText}</Alert>

  return (
    <Container maxWidth={false} className={classes.container}>
      <FormContent
        formSchema={states.formSchema as FormObject}
        resolver={WizardAjvResolver(states.validationSchema, locale)}
        onSubmit={onSubmit as SubmitHandler<FieldValues>}
        objectType={objectType}
        folder={folder}
        currentObject={currentObject}
        key={currentObject?.accessionId || folder.folderId}
        closeDialog={closeDialog || (() => ({}))}
      />
      {submitting && <LinearProgress />}
    </Container>
  )
}

export default WizardFillObjectDetailsForm
