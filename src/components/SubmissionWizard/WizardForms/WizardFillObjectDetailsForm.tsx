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
import { cloneDeep, set, isEqual } from "lodash"
import { useForm, FormProvider, FieldValues, SubmitHandler } from "react-hook-form"
import type { FieldErrors, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"
import getLinkedDereferencedSchema from "../WizardHooks/WizardLinkedDereferencedSchemaHook"
import submitObjectHook from "../WizardHooks/WizardSubmitObjectHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
//import WizardXMLUploadModal from "./WizardXMLUploadModal"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectTypes } from "constants/wizardObject"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { setClearForm } from "features/clearFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { addDoiInfoToSubmission } from "features/wizardSubmissionSlice"
//import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import type {
  DoiFormDetails,
  SubmissionDetailsWithId,
  CurrentFormObject,
  FormObject,
  HandlerRef,
} from "types"
import { getAccessionIds } from "utils"
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
  ref: HandlerRef
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
      onClick={objectType === ObjectTypes.datacite ? onClickSaveDOI : onClickSubmit}
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
  ref,
}: FormContentProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const clearForm = useAppSelector(state => state.clearForm)
  // const alert = useAppSelector(state => state.alert)

  const currentObjectId = currentObject?.accessionId

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

  const handleFormBlur = () => {
    // For every dirty field, check if default value matches current value
    const isDirty = Object.keys(methods.formState.dirtyFields).some(field => {
      const value = methods.getValues(field)
      const defaultValue = methods.formState.defaultValues?.[field]

      if (value && !defaultValue) {
        // No default value to compare against
        return true
      }
      if (Array.isArray(value)) {
        // value is an array (e.g. nested fields)
        return value.some((item, i) => {
          if (!defaultValue?.[i]) {
            // new item added
            return true
          }
          if (!isEqual(item, defaultValue[i])) {
            // existing item modified
            return true
          }
          return false
        })
      }
      return value !== defaultValue
    })
    dispatch(isDirty ? setUnsavedForm() : resetUnsavedForm())
  }

  const handleDOISubmit = async (data: DoiFormDetails) => {
    dispatch(addDoiInfoToSubmission(submission.submissionId, data))
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
  //   if (![ObjectTypes.datacite, ObjectTypes.study].includes(objectType)) startTimer()
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

  //       if (objectType === ObjectTypes.analysis || objectType === ObjectTypes.run) {
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

  // const handleReset = () => {
  //   methods.reset({ undefined })
  //   setCurrentObjectId(null)
  // }

  return (
    <FormProvider {...methods}>
      <CustomCardHeader
        objectType={objectType}
        refForm="hook-form"
        onClickSubmit={() => {}}
        onClickSaveDOI={methods.handleSubmit(
          async data => handleDOISubmit(data as DoiFormDetails),
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
        ref={ref as RefObject<HTMLFormElement>}
        onBlur={() => handleFormBlur()}
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
  const objects = useAppSelector(state => state.stepObjects)

  const { t } = useTranslation()

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
            helperText: t("snackbarMessages.error.helperText.cacheFormFields"),
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
        objects,
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
  }, [objectType])

  // All Analysis AccessionIds
  const analysisAccessionIds = getAccessionIds(ObjectTypes.analysis, objects)

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
   * Submit a new or existing form with cleaned values and check for response errors
   */
  const onSubmit = (data: Record<string, unknown>) => {
    if (Object.keys(data).length === 0) return

    startTransition(
      async () => await submitObjectHook(data, submission.submissionId, objectType, dispatch)
    )
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
