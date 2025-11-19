/* XML upload is disabled for MVP */
/* Breaking change for JSON schema version draft-2020-12:
 * https://ajv.js.org/json-schema.html#draft-2020-12
 */
import React, { useEffect, useState, useRef, useTransition } from "react"

import { GlobalStyles } from "@mui/material"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import LinearProgress from "@mui/material/LinearProgress"
import { Box, styled } from "@mui/system"
import { cloneDeep } from "lodash"
import { useForm, FormProvider, FieldValues, SubmitHandler, Resolver } from "react-hook-form"
import type { FieldErrors, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"
import checkUnsavedInputHook from "../WizardHooks/WizardCheckUnsavedInputHook"
import submitObjectHook from "../WizardHooks/WizardSubmitObjectHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
//import WizardXMLUploadModal from "./WizardXMLUploadModal"

import { ResponseStatus } from "constants/responseStatus"
import { Namespaces } from "constants/translation"
import { SDObjectTypes } from "constants/wizardObject"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { setClearForm } from "features/clearFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetUnsavedForm } from "features/unsavedFormSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { addMetadataToSubmission } from "features/wizardSubmissionSlice"
//import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type {
  MetadataFormDetails,
  SubmissionDetailsWithId,
  CurrentFormObject,
  FormObject,
} from "types"
import {
  dereferenceSchema,
  loadJSONSchema,
  validateJSONSchema,
  localizeSchema,
} from "utils/JSONSchemaUtils"

const Form = styled("form")(({ theme }) => ({
  ...theme.form,
}))

type CustomCardHeaderProps = {
  objectType: string
  onClickSubmit: () => void
  onClickSaveDOI: () => Promise<void>
  // onClickClearForm: () => void
  // onOpenXMLModal: () => void
  // onDeleteForm: () => void
  refForm: string
}

type FormContentProps = {
  methods: UseFormReturn
  formSchema: FormObject
  onSubmit: SubmitHandler<FieldValues>
  objectType: string
  submission: SubmissionDetailsWithId
  currentObject: CurrentFormObject
}

/*
 * Create header for form card with button to close the card
 */
const CustomCardHeader = (props: CustomCardHeaderProps) => {
  const {
    objectType,
    refForm,
    onClickSubmit,
    onClickSaveDOI,
    // onClickClearForm,
    // onOpenXMLModal,
    // onDeleteForm,
  } = props

  const focusTarget = useRef<HTMLButtonElement>(null)
  const shouldFocus = useAppSelector(state => state.focus)
  const { t } = useTranslation()

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const SaveButton = (
    <Button
      ref={focusTarget}
      variant="contained"
      aria-label={t("ariaLabels.submitForm")}
      size="small"
      onClick={objectType === SDObjectTypes.publicMetadata ? onClickSaveDOI : onClickSubmit}
      form={refForm}
      data-testid="form-datacite"
      type="submit"
    >
      {t("save")}
    </Button>
  )

  return <WizardStepContentHeader action={SaveButton} />
}

/*
 * Return react-hook-form based form which is rendered from schema and checked against resolver.
 */
const FormContent = ({
  methods,
  formSchema,
  onSubmit,
  objectType,
  submission,
  currentObject,
}: FormContentProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const clearForm = useAppSelector(state => state.clearForm)
  // const alert = useAppSelector(state => state.alert)
  const [currentObjectId, setCurrentObjectId] = useState<string | null>(currentObject?.accessionId)

  // const autoSaveTimer: { current: NodeJS.Timeout | null } = useRef(null)
  // let timer = 0

  // const { isSubmitSuccessful } = methods.formState

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
    //   if (isSubmitSuccessful) {
    dispatch(setClearForm(false))
  }, [clearForm])

  // useEffect(() => {
  //   checkDirty()
  // }, [methods.formState.isDirty])

  // const handleClearForm = () => {
  //   methods.reset({ undefined })
  //   dispatch(setClearForm(true))
  //   dispatch(
  //     setCurrentObject({ })
  //   )
  // }

  // Check if the form is empty
  // const isFormCleanedValuesEmpty = (cleanedValues: {
  //   [x: string]: unknown
  //   [x: number]: unknown
  //   accessionId?: string
  //   lastModified?: string
  //   objectType?: string
  //   status?: string
  //   title?: string
  //   submissionType?: string
  // }) => {
  //   return Object.keys(cleanedValues).filter(val => val !== "index").length === 0
  // }

  // const checkDirty = () => {
  //   const isFormTouched = () => {
  //     return Object.keys(methods.formState.dirtyFields).length > 0
  //   }
  // }

  const getCleanedValues = () =>
    JSONSchemaParser.cleanUpFormValues(methods.getValues()) as CurrentFormObject

  const handleChange = () => {
    clearForm ? dispatch(setClearForm(false)) : null
    const clone = cloneDeep(currentObject)
    const values = getCleanedValues()

    if (clone && Object.keys(values).filter(val => val !== "index").length > 0) {
      Object.keys(values).forEach(item => (clone[item] = values[item]))

      !currentObject.accessionId && currentObjectId
        ? dispatch(
            setCurrentObject({
              ...clone,
              cleanedValues: values,
              objectId: currentObjectId,
            })
          )
        : dispatch(setCurrentObject({ ...clone, cleanedValues: values }))
    }
  }

  const handleMetadataSubmit = async (data: MetadataFormDetails) => {
    dispatch(addMetadataToSubmission(submission.submissionId, data))
      .then(() => {
        dispatch(resetAutocompleteField())
        // dispatch(resetCurrentObject())
        methods.reset(data, { keepValues: true })
        dispatch(resetUnsavedForm())
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
            helperText: "snackbarMessages.error.helperText.submitDoi",
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
   * This helps with getting current accession ID and form data without rendering on every timer increment.
   */

  // const startTimer = () => {
  //   autoSaveTimer.current = setInterval(() => {
  //     timer = timer + 1
  //     if (timer >= 60) {
  //     }
  //   }, 1000)
  // }

  // const resetTimer = () => {
  //   clearInterval(autoSaveTimer.current as NodeJS.Timeout)
  //   timer = 0
  // }

  // const keyHandler = () => {
  //   resetTimer()

  //   // Prevent auto save from DOI form
  //   if (![SDObjectTypes.datacite, FEGAObjectTypes.study].includes(objectType)) startTimer()
  // }

  // useEffect(() => {
  //   window.addEventListener("keydown", keyHandler)
  //   return () => {
  //     resetTimer()
  //     window.removeEventListener("keydown", keyHandler)
  //   }
  // }, [])

  // const emptyFormError = () => {
  //   dispatch(
  //     updateStatus({
  //       status: ResponseStatus.info,
  //       helperText: t("snackbarMessages.info.emptyForm"),
  //     })
  //   )
  // }

  /*const handleXMLModalOpen = () => {
    dispatch(setXMLModalOpen())
  }*/

  // const handleDeleteForm = async () => {
  //   if (currentObjectId) {
  //     try {
  //       *TODO: deleteObjectFromSubmission is removed, need to replace this func.
  //       await dispatch(
  //         deleteObjectFromSubmission(currentObject.status, currentObjectId, objectType)
  //       )
  //       handleReset()
  //       handleChange()
  //       dispatch(resetCurrentObject())

  //       if (objectType === FEGAObjectTypes.analysis || objectType === FEGAObjectTypes.run) {
  //         dispatch(deleteFileType(currentObjectId))
  //       }
  //     } catch (error) {
  //       dispatch(
  //         updateStatus({
  //           status: ResponseStatus.error,
  //           response: error,
  //           helperText: "snackbarMessages.error.helperText.deleteObject",
  //         })
  //       )
  //     }
  //   }
  // }

  const handleReset = () => {
    methods.reset({ undefined })
    setCurrentObjectId(null)
  }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        objectType={objectType}
        refForm="hook-form"
        onClickSubmit={() => {}}
        onClickSaveDOI={methods.handleSubmit(
          async data => handleMetadataSubmit(data as MetadataFormDetails),
          handleValidationErrors
        )}
        // onClickClearForm={() => handleClearForm()}
        // onOpenXMLModal={() => handleXMLModalOpen()}
        // onDeleteForm={() => handleDeleteForm()}
      />
      <Form
        id="hook-form"
        onChange={() => handleChange()}
        onSubmit={methods.handleSubmit(onSubmit)}
        onReset={handleReset}
        onBlur={() =>
          checkUnsavedInputHook(
            methods.formState.dirtyFields,
            methods.formState.defaultValues,
            methods.getValues,
            dispatch
          )
        }
      >
        <Box>{JSONSchemaParser.buildFields(formSchema)}</Box>
      </Form>
    </FormProvider>
  )
}

/*
 * Container for json schema based form. Handles json schema loading, form rendering, form submitting and error/success alerts.
 */
const WizardFillObjectDetailsForm = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const objectType = useAppSelector(state => state.objectType)
  const submission = useAppSelector(state => state.submission)
  const currentObject = useAppSelector(state => state.currentObject)
  const locale = useAppSelector(state => state.locale)

  //const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  const [states, setStates] = useState({
    baseSchema: {}, // keep the orginal version of schema that won't be changed with translation
    formSchema: {},
    isLoading: true,
  })

  const [namespace, setNamespace] = useState("")

  const resolver = WizardAjvResolver(states.formSchema, locale) as Resolver<
    Record<string, unknown>,
    unknown,
    {}
  >
  const methods = useForm({ mode: "onBlur", resolver })

  const [submitting, startTransition] = useTransition()

  /*
   * Fetch json schema from either session storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      let currentSchema

      if (objectType === SDObjectTypes.publicMetadata) {
        const submissionSchema = await loadJSONSchema("submission")
        const metadataSchema = submissionSchema.properties.metadata
        currentSchema = metadataSchema
        setNamespace(Namespaces.submissionMetadata)
        if (submission.metadata) dispatch(setCurrentObject(submission.metadata))
      } else {
        // Use case for other JSON schemas in the future.
        // set to correct i18n namespace if necessary.
        const schema = await loadJSONSchema(objectType)
        currentSchema = schema
      }
      validateJSONSchema(currentSchema)
      const dereferencedSchema: Promise<FormObject> = await dereferenceSchema(
        currentSchema as FormObject
      )

      setStates({
        ...states,
        baseSchema: { ...dereferencedSchema },
        formSchema: { ...dereferencedSchema },
        isLoading: false,
      })
    }

    // Only fetch schema for SD's publicMetadata for now
    if (objectType === SDObjectTypes.publicMetadata) fetchSchema()
  }, [objectType])

  useEffect(() => {
    const localizedSchema = localizeSchema(objectType, namespace, states.baseSchema, t)
    setStates({ ...states, formSchema: { ...localizedSchema } })
  }, [locale, states.baseSchema])

  /*
   * Submit a new or existing form with cleaned values and check for response errors
   */
  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      if (!Object.keys(data).length) return
      const response = await submitObjectHook(data, submission.submissionId, objectType, dispatch)
      if (response["ok"]) {
        methods.reset(data, { keepValues: true })
        dispatch(resetUnsavedForm())
      }
    })
  }

  if (states.isLoading) return <CircularProgress />

  return (
    <>
      <GlobalStyles styles={{ ".MuiContainer-root": { maxWidth: "100% !important" } }} />
      <Container sx={{ m: 0, p: 0, width: "100%", boxSizing: "border-box" }} maxWidth={false}>
        <FormContent
          formSchema={states.formSchema as FormObject}
          methods={methods}
          onSubmit={onSubmit as SubmitHandler<FieldValues>}
          objectType={objectType}
          submission={submission}
          currentObject={currentObject}
          key={currentObject?.accessionId || submission.submissionId}
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
