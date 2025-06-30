/* XML upload is disabled for MVP */
/* Breaking change for JSON schema version draft-2020-12:
 * https://ajv.js.org/json-schema.html#draft-2020-12
 */
import React, { useEffect, useState, useRef, useTransition, RefObject } from "react"

import CancelIcon from "@mui/icons-material/Cancel"
import { GlobalStyles } from "@mui/material"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import { Box, styled } from "@mui/system"
import Ajv2020 from "ajv/dist/2020"
import { ApiResponse } from "apisauce"
import { cloneDeep, set } from "lodash"
import { useForm, FormProvider, FieldValues, SubmitHandler } from "react-hook-form"
import type { FieldErrors, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"
import getLinkedDereferencedSchema from "../WizardHooks/WizardLinkedDereferencedSchemaHook"
import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"
import submitObjectHook from "../WizardHooks/WizardSubmitObjectHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
import WizardOptions from "./WizardOptions"
//import WizardXMLUploadModal from "./WizardXMLUploadModal"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { setClearForm } from "features/clearFormSlice"
import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { setFileTypes, deleteFileType } from "features/fileTypesSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import {
  deleteObjectFromSubmission,
  replaceObjectInSubmission,
  addDoiInfoToSubmission,
} from "features/wizardSubmissionSlice"
//import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import type {
  DoiFormDetails,
  SubmissionDetailsWithId,
  FormDataFiles,
  FormObject,
  ObjectDetails,
  ObjectDisplayValues,
  HandlerRef,
} from "types"
import {
  getObjectDisplayTitle,
  getAccessionIds,
  getNewUniqueFileTypes,
  checkObjectStatus,
} from "utils"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const CustomAlert = styled(Alert)(({ theme, severity }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1.25rem solid ${
    severity === "error" ? theme.palette.error.main : theme.palette.success.main
  }`,
  borderTop: `0.25rem solid ${
    severity === "error" ? theme.palette.error.main : theme.palette.success.main
  }`,
  borderRight: `0.25rem solid ${
    severity === "error" ? theme.palette.error.main : theme.palette.success.main
  }`,
  borderBottom: `0.25rem solid ${
    severity === "error" ? theme.palette.error.main : theme.palette.success.main
  }`,
  "& .MuiAlert-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 0.5rem",
  },
  lineHeight: "1.75",
  boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
  position: "relative",
  padding: "1rem",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "40%",
  margin: "6.25rem auto 0 auto",
}))

const AlertMessage = styled(Typography)({
  fontWeight: "bold",
})

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gridTemplateColumns: "repeat(3, 1fr)",
  columnGap: "2rem",
  marginLeft: "2rem",
  marginRight: "3rem",
  "& button": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    height: "4.5rem",
    width: "16rem",
  },
}))

const Form = styled("form")(({ theme }) => ({
  ...theme.form,
}))

type CustomCardHeaderProps = {
  hasSubmittedObject: boolean
  hasDraftObject: boolean
  objectType: string
  currentObject: ObjectDetails
  onClickSaveDraft: () => Promise<void>
  onClickSubmit: () => void
  onClickSaveDOI: () => Promise<void>
  onClickClearForm: () => void
  //onOpenXMLModal: () => void
  onDeleteForm: () => void
  refForm: string
}

type FormContentProps = {
  methods: UseFormReturn
  formSchema: FormObject
  onSubmit: SubmitHandler<FieldValues>
  objectType: string
  submission: SubmissionDetailsWithId
  hasDraftObject: boolean
  hasSubmittedObject: boolean
  currentObject: ObjectDetails & { objectId: string; [key: string]: unknown }
  ref: HandlerRef
}

/*
 * Create header for form card with button to close the card
 */
const CustomCardHeader = (props: CustomCardHeaderProps) => {
  const {
    hasSubmittedObject,
    hasDraftObject,
    objectType,
    currentObject,
    refForm,
    onClickSaveDraft,
    onClickSubmit,
    onClickSaveDOI,
    onClickClearForm,
    //onOpenXMLModal,
    onDeleteForm,
  } = props

  const focusTarget = useRef<HTMLButtonElement>(null)
  const shouldFocus = useAppSelector(state => state.focus)
  const { t } = useTranslation()

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const buttonGroup = (
    <Box display="flex">
      <WizardOptions
        objectType={objectType}
        onClearForm={onClickClearForm}
        //onOpenXMLModal={onOpenXMLModal}
        onDeleteForm={onDeleteForm}
        /*disableUploadXML={
          objectType === ObjectTypes.study && (hasDraftObject || hasSubmittedObject)
        }*/
      />
      <ButtonGroup>
        <Button
          variant="contained"
          aria-label="save form as draft"
          size="small"
          onClick={onClickSaveDraft}
          data-testid="form-draft"
          disabled={objectType === ObjectTypes.study && hasSubmittedObject}
        >
          {(objectType === ObjectTypes.study && hasDraftObject) ||
          currentObject?.status === ObjectStatus.draft
            ? t("formActions.updateDraft")
            : t("formActions.saveAsDraft")}
        </Button>
        <Button
          variant="contained"
          aria-label="submit form"
          size="small"
          type="submit"
          onClick={onClickSubmit}
          form={refForm}
          data-testid="form-ready"
          disabled={
            objectType === ObjectTypes.study && hasSubmittedObject && !currentObject.accessionId
          }
        >
          {(objectType === ObjectTypes.study && hasSubmittedObject) ||
          currentObject?.status === ObjectStatus.submitted
            ? t("formActions.update")
            : t("formActions.markAsReady")}
        </Button>
      </ButtonGroup>
    </Box>
  )

  const doiButtonGroup = (
    <Box display="flex">
      <WizardOptions
        objectType={objectType}
        onClearForm={onClickClearForm}
        //onOpenXMLModal={onOpenXMLModal}
        onDeleteForm={onDeleteForm}
      />
      <ButtonGroup>
        <Button
          variant="contained"
          aria-label="save Datacite"
          size="small"
          onClick={onClickSaveDOI}
          data-testid="form-datacite"
        >
          {t("save")}
        </Button>
      </ButtonGroup>
    </Box>
  )

  return (
    <WizardStepContentHeader
      action={objectType === ObjectTypes.datacite ? doiButtonGroup : buttonGroup}
    />
  )
}

/*
 * Draft save and object patch use both same response handler
 */
const patchHandler = (
  response: ApiResponse<unknown>,
  submission: SubmissionDetailsWithId,
  accessionId: string,
  objectType: string,
  cleanedValues: Record<string, unknown>,
  dispatch: (reducer: unknown) => void
) => {
  if (response.ok) {
    dispatch(
      replaceObjectInSubmission(
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
  methods,
  formSchema,
  onSubmit,
  objectType,
  hasDraftObject,
  hasSubmittedObject,
  submission,
  currentObject,
  ref,
}: FormContentProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const alert = useAppSelector(state => state.alert)
  const clearForm = useAppSelector(state => state.clearForm)

  const [currentObjectId, setCurrentObjectId] = useState<string | null>(currentObject?.accessionId)
  const [draftAutoSaveAllowed, setDraftAutoSaveAllowed] = useState(false)

  const autoSaveTimer: { current: NodeJS.Timeout | null } = useRef(null)
  let timer = 0

  // Set form default values
  useEffect(() => {
    try {
      const mutable = cloneDeep(currentObject)
      methods.reset(mutable)
    } catch (e) {
      console.error("Reset failed:", e)
    }
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
      if (
        currentObject?.status === ObjectStatus.draft &&
        currentObjectId &&
        Object.keys(currentObject).length > 0
      ) {
        handleDeleteForm()
      }
    }
  }, [isSubmitSuccessful])

  const handleClearForm = () => {
    resetTimer()
    methods.reset({ undefined })
    dispatch(setClearForm(true))
    dispatch(
      setCurrentObject({
        objectId: currentObjectId,
        status: currentObject.status,
      })
    )
  }

  // Check if the form is empty
  const isFormCleanedValuesEmpty = (cleanedValues: {
    [x: string]: unknown
    [x: number]: unknown
    accessionId?: string
    lastModified?: string
    objectType?: string
    status?: string
    title?: string
    submissionType?: string
  }) => {
    return Object.keys(cleanedValues).filter(val => val !== "index").length === 0
  }

  const checkDirty = () => {
    const isFormTouched = () => {
      return Object.keys(methods.formState.dirtyFields).length > 0
    }

    if (isFormTouched()) {
      dispatch(setDraftStatus("notSaved"))
    } else dispatch(resetDraftStatus())
  }

  const getCleanedValues = () =>
    JSONSchemaParser.cleanUpFormValues(methods.getValues()) as ObjectDetails

  // Draft data is set to state on every change to form
  const handleChange = () => {
    clearForm ? dispatch(setClearForm(false)) : null
    const clone = cloneDeep(currentObject)
    const values = getCleanedValues()

    if (clone && !isFormCleanedValuesEmpty(values)) {
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

  const handleDOISubmit = async (data: DoiFormDetails) => {
    dispatch(addDoiInfoToSubmission(submission.submissionId, data))
      .then(() => {
        dispatch(resetAutocompleteField())
        dispatch(resetCurrentObject())
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "snackbarMessages.success.doi.saved",
          })
        )
      })
      .catch(error =>
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "snackbarMessages.error.helperText.submitDoiError",
          })
        )
      )
  }

  const handleValidationErrors = (errors: FieldErrors) => {
    const missingRequired = Object.values(errors).some(err =>
      err?.message?.toString().includes("required")
    )
    const message = missingRequired
      ? t("snackbarMessages.info.requiredFields")
      : t("snackbarMessages.info.invalidFields")
    dispatch(
      updateStatus({
        status: ResponseStatus.info,
        helperText: message,
      })
    )
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

    // Prevent auto save from DOI form
    if (![ObjectTypes.datacite, ObjectTypes.study].includes(objectType)) startTimer()
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
        helperText: t("snackbarMessages.info.emptyForm"),
      })
    )
  }

  /*
   * Update or save new draft depending on object status
   */
  const handleSaveDraft = async () => {
    resetTimer()
    const cleanedValues = getCleanedValues()

    if (!isFormCleanedValuesEmpty(cleanedValues)) {
      const handleSave = await saveDraftHook({
        accessionId: currentObject.accessionId || currentObject.objectId,
        objectType: objectType,
        objectStatus: currentObject.status,
        submission: submission,
        values: cleanedValues,
        dispatch: dispatch,
      })

      if (handleSave.ok && currentObject?.status !== ObjectStatus.submitted) {
        setCurrentObjectId(handleSave.data.accessionId)
        const clone = cloneDeep(currentObject)
        dispatch(
          setCurrentObject({
            ...clone,
            status: currentObject.status || ObjectStatus.draft,
            accessionId: handleSave.data.accessionId,
          })
        )
        dispatch(resetDraftStatus())
      }
    } else {
      emptyFormError()
    }
  }

  /*const handleXMLModalOpen = () => {
    dispatch(setXMLModalOpen())
  }*/

  const handleDeleteForm = async () => {
    if (currentObjectId) {
      try {
        await dispatch(
          deleteObjectFromSubmission(currentObject.status, currentObjectId, objectType)
        )
        handleReset()
        handleChange()
        dispatch(resetCurrentObject())

        // Delete fileType that is equivalent to deleted object (for Run and Analysis cases)
        if (objectType === ObjectTypes.analysis || objectType === ObjectTypes.run) {
          dispatch(deleteFileType(currentObjectId))
        }
      } catch (error) {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "snackbarMessages.error.helperText.deleteObjectFromSubmission",
          })
        )
      }
    }
  }

  const handleReset = () => {
    methods.reset({ undefined })
    setCurrentObjectId(null)
  }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        hasSubmittedObject={hasSubmittedObject}
        hasDraftObject={hasDraftObject}
        objectType={objectType}
        currentObject={currentObject}
        refForm="hook-form"
        onClickSaveDraft={() => handleSaveDraft()}
        onClickSubmit={() => resetTimer()}
        onClickSaveDOI={methods.handleSubmit(
          async data => handleDOISubmit(data as DoiFormDetails),
          handleValidationErrors
        )}
        onClickClearForm={() => handleClearForm()}
        //onOpenXMLModal={() => handleXMLModalOpen()}
        onDeleteForm={() => handleDeleteForm()}
      />
      <Form
        id="hook-form"
        onChange={() => handleChange()}
        onSubmit={methods.handleSubmit(onSubmit)}
        ref={ref as RefObject<HTMLFormElement>}
        onReset={handleReset}
      >
        <Box>{JSONSchemaParser.buildFields(formSchema)}</Box>
      </Form>
    </FormProvider>
  )
}

/*
 * Container for json schema based form. Handles json schema loading, form rendering, form submitting and error/success alerts.
 */
const WizardFillObjectDetailsForm = ({ ref }: { ref?: HandlerRef }) => {
  const dispatch = useAppDispatch()

  const objectType = useAppSelector(state => state.objectType)
  const submission = useAppSelector(state => state.submission)
  const currentObject = useAppSelector(state => state.currentObject)
  const locale = useAppSelector(state => state.locale)
  //const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  const { hasDraftObject, hasSubmittedObject } = checkObjectStatus(submission, objectType)

  // States that will update in useEffect()
  const [states, setStates] = useState({
    error: false,
    helperText: "",
    formSchema: {},
    validationSchema: {} as FormObject,
    isLoading: true,
  })
  const resolver = WizardAjvResolver(states.validationSchema, locale)
  const methods = useForm({ mode: "onBlur", resolver })

  const [submitting, startTransition] = useTransition()

  /*
   * Fetch json schema from either session storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      const schema: string | null = sessionStorage.getItem(`cached_${objectType}_schema`)
      let parsedSchema: FormObject
      const ajv = new Ajv2020()

      if (!schema || !ajv.validateSchema(JSON.parse(schema))) {
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
      let dereferencedSchema: Promise<FormObject> = await dereferenceSchema(
        parsedSchema as FormObject
      )

      dereferencedSchema = getLinkedDereferencedSchema(
        currentObject,
        parsedSchema.title.toLowerCase(),
        dereferencedSchema,
        submission.metadataObjects,
        analysisAccessionIds
      )

      // In local state also remove "Datacite" from string coming from schema submission.doiInfo.title
      setStates({
        ...states,
        formSchema: {
          ...dereferencedSchema,
          title: parsedSchema.title.toLowerCase().includes(ObjectTypes.datacite)
            ? parsedSchema.title.slice(9)
            : parsedSchema.title,
        },
        validationSchema: parsedSchema,
        isLoading: false,
      })
    }

    // In case of there is object type, and Summary amd Publish do not have schema
    if (
      objectType.length &&
      objectType !== "file" &&
      objectType !== "Summary" &&
      objectType !== "Publish"
    )
      fetchSchema()

    // Reset current object in state on unmount
    return () => {
      dispatch(resetDraftStatus())
    }
  }, [objectType])

  // All Analysis AccessionIds
  const analysisAccessionIds = getAccessionIds(ObjectTypes.analysis, submission.metadataObjects)

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
    if (Object.keys(data).length === 0) return

    // Handle submitted object update
    const patchObject = async () => {
      const accessionId = data.accessionId as string
      const cleanedValues = JSONSchemaParser.cleanUpFormValues(data)
      try {
        const response = await objectAPIService.patchFromJSON(
          objectType,
          accessionId,
          cleanedValues
        )

        patchHandler(
          response,
          submission,
          currentObject.accessionId,
          objectType,
          cleanedValues,
          dispatch
        )
        dispatch(resetCurrentObject())
        methods.reset({ undefined })
        // Dispatch fileTypes if object is Run or Analysis
        if (objectType === ObjectTypes.run || objectType === ObjectTypes.analysis) {
          const objectWithFileTypes = getNewUniqueFileTypes(
            accessionId,
            cleanedValues as FormDataFiles
          )
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
    }

    startTransition(async () => {
      // Either patch object or submit a new object
      if (data.status === ObjectStatus.submitted) {
        await patchObject()
      } else {
        await submitObjectHook(data, submission.submissionId, objectType, dispatch)
        methods.reset({ undefined })
      }
    })
  }

  if (states.isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (states.error)
    return (
      <CustomAlert severity="error" icon={<CancelIcon sx={{ fontSize: "2rem" }} />}>
        <AlertMessage>{states.helperText}</AlertMessage>
      </CustomAlert>
    )

  return (
    <>
      <GlobalStyles styles={{ ".MuiContainer-root": { maxWidth: "100% !important" } }} />
      <Container sx={{ m: 0, p: 0, width: "100%", boxSizing: "border-box" }} maxWidth={false}>
        <FormContent
          formSchema={states.formSchema as FormObject}
          methods={methods}
          onSubmit={onSubmit as SubmitHandler<FieldValues>}
          objectType={objectType}
          hasDraftObject={hasDraftObject}
          hasSubmittedObject={hasSubmittedObject}
          submission={submission}
          currentObject={currentObject}
          key={currentObject?.accessionId || submission.submissionId}
          ref={ref}
        />
        {submitting && <LinearProgress />}
        {/*<WizardXMLUploadModal
          open={openedXMLModal}
          handleClose={() => {
            dispatch(resetXMLModalOpen())
          }}
        />*/}
      </Container>
    </>
  )
}

export default WizardFillObjectDetailsForm
