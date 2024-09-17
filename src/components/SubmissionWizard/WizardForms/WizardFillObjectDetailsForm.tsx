/* Breaking change for JSON schema version draft-2020-12:
 * https://ajv.js.org/json-schema.html#draft-2020-12
 */
import React, { useEffect, useState, useRef, RefObject } from "react"

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
import { useForm, FormProvider, FieldValues, Resolver, SubmitHandler } from "react-hook-form"
import { useTranslation } from "react-i18next"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"
import getLinkedDereferencedSchema from "../WizardHooks/WizardLinkedDereferencedSchemaHook"
import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"
import submitObjectHook from "../WizardHooks/WizardSubmitObjectHook"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"
import WizardOptions from "./WizardOptions"
import WizardXMLUploadModal from "./WizardXMLUploadModal"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { setClearForm } from "features/clearFormSlice"
import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { setFileTypes, deleteFileType } from "features/fileTypesSlice"
import { updateStatus } from "features/statusMessageSlice"
import { updateTemplateDisplayTitle } from "features/templateSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import {
  deleteObjectFromSubmission,
  replaceObjectInSubmission,
  addDoiInfoToSubmission,
} from "features/wizardSubmissionSlice"
import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"
import templateAPI from "services/templateAPI"
import type {
  DoiFormDetails,
  SubmissionDetailsWithId,
  FormDataFiles,
  FormObject,
  ObjectDetails,
  ObjectDisplayValues,
  FormRef,
} from "types"
import { getObjectDisplayTitle, getAccessionIds, getNewUniqueFileTypes } from "utils"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const StickyContainer = styled(Container)(({ theme }) => ({
  position: "sticky",
  top: "0px",
  zIndex: 1200,
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  width: "100%",
  margin: 0,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  boxSizing: "border-box",
}))

const CustomAlert = styled(Alert)(({ theme, severity }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "info"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderTop: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "info"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderRight: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "info"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  borderBottom: `0.25rem solid ${
    severity === "error"
      ? theme.palette.error.main
      : severity === "info"
      ? theme.palette.error.light
      : theme.palette.success.light
  }`,
  "& .MuiAlert-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 0.5rem",
  },
  color: theme.palette.secondary.main,
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

const Form = styled("form")<{ submittedStudy: boolean }>(({ theme }) => ({
  ...theme.form,
}))

type CustomCardHeaderProps = {
  submittedStudy: boolean,
  objectType: string
  currentObject: ObjectDetails
  onClickSaveDraft: () => Promise<void>
  onClickUpdateTemplate: () => Promise<void>
  onClickSubmit: () => void
  onClickSaveDOI: () => Promise<void>
  onClickCloseDialog: () => void
  onClickClearForm: () => void
  onOpenXMLModal: () => void
  onDeleteForm: () => void
  refForm: string
}

type FormContentProps = {
  resolver: Resolver<FieldValues, Record<string, unknown>>
  formSchema: FormObject
  onSubmit: SubmitHandler<FieldValues>
  objectType: string
  submission: SubmissionDetailsWithId
  currentObject: ObjectDetails & { objectId: string; [key: string]: unknown }
  closeDialog: () => void
  formRef?: FormRef
}

/*
 * Create header for form card with button to close the card
 */
const CustomCardHeader = (props: CustomCardHeaderProps) => {
  const {
    submittedStudy,
    objectType,
    currentObject,
    refForm,
    onClickSaveDraft,
    onClickUpdateTemplate,
    onClickSubmit,
    onClickSaveDOI,
    onClickCloseDialog,
    onClickClearForm,
    onOpenXMLModal,
    onDeleteForm,
  } = props

  const focusTarget = useRef<HTMLButtonElement>(null)
  const shouldFocus = useAppSelector(state => state.focus)
  const { t } = useTranslation()

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const templateButtonGroup = (
    <ButtonGroup>
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
    </ButtonGroup>
  )

  const buttonGroup = (
    <Box display="flex">
      <WizardOptions
        objectType={objectType}
        onClearForm={onClickClearForm}
        onOpenXMLModal={onOpenXMLModal}
        onDeleteForm={onDeleteForm}
      />
      <ButtonGroup>
        <Button
          variant="contained"
          aria-label="save form as draft"
          size="small"
          onClick={onClickSaveDraft}
          data-testid="form-draft"
        >
          {currentObject?.status === ObjectStatus.draft
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
          disabled={currentObject?.status === ObjectStatus.draft
            && objectType === ObjectTypes.study
            && submittedStudy}
        >
          {(currentObject?.status === ObjectStatus.submitted )
          || (objectType === ObjectTypes.study && submittedStudy)
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
    <StickyContainer>
      <WizardStepContentHeader
        action={currentObject?.status === ObjectStatus.template
          ?  templateButtonGroup
          : (objectType === "datacite")
          ?  doiButtonGroup
          : buttonGroup}
      />
    </StickyContainer>
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
  resolver,
  formSchema,
  onSubmit,
  objectType,
  submission,
  currentObject,
  closeDialog,
  formRef,
}: FormContentProps) => {
  const dispatch = useAppDispatch()

  const draftStatus = useAppSelector(state => state.draftStatus)
  const alert = useAppSelector(state => state.alert)
  const clearForm = useAppSelector(state => state.clearForm)

  const templates = useAppSelector(state => state.templates)
  const methods = useForm({ mode: "onBlur", resolver })

  const [currentObjectId, setCurrentObjectId] = useState<string | null>(currentObject?.accessionId)
  const [draftAutoSaveAllowed, setDraftAutoSaveAllowed] = useState(false)

  const submittedStudy: boolean = submission.metadataObjects
  .filter(object => object.schema === ObjectTypes.study).length > 0

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
      if (
        currentObject?.status === ObjectStatus.draft &&
        currentObjectId &&
        Object.keys(currentObject).length > 0
      )
        handleDeleteForm()
    }
  }, [isSubmitSuccessful])

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
    const isFormTouched = () => {
      return Object.keys(methods.formState.dirtyFields).length > 0
    }
    if (isFormTouched() && draftStatus === "" && checkFormCleanedValuesEmpty(getCleanedValues())) {
      dispatch(setDraftStatus("notSaved"))
    }
  }

  const getCleanedValues = () =>
    JSONSchemaParser.cleanUpFormValues(methods.getValues()) as ObjectDetails

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

    // Prevent auto save from DOI form and template dialog
    if (currentObject?.status !== ObjectStatus.template )
      if (objectType !== "datacite") startTimer()
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
      const index =
        templates?.findIndex(
          (item: { accessionId: string }) => item.accessionId === currentObject.accessionId
        ) || 0
      const response = await templateAPI.patchTemplateFromJSON(
        objectType,
        currentObject.accessionId,
        cleanedValues,
        index
      )

      const displayTitle = getObjectDisplayTitle(
        objectType,
        cleanedValues as unknown as ObjectDisplayValues
      )

      if (response.ok) {
        closeDialog()
        dispatch(
          updateTemplateDisplayTitle({
            accessionId: currentObject.accessionId,
            displayTitle: displayTitle,
          })
        )

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
        submission: submission,
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

  const handleXMLModalOpen = () => {
    dispatch(setXMLModalOpen())
  }

  const handleDeleteForm = async () => {
    if (currentObjectId) {
      try {
        await dispatch(
          deleteObjectFromSubmission(currentObject.status, currentObjectId, objectType)
        )

        dispatch(resetCurrentObject())
        handleReset()
        handleChange()

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
        submittedStudy={submittedStudy}
        objectType={objectType}
        currentObject={currentObject}
        refForm="hook-form"
        onClickSaveDraft={() => handleSaveDraft()}
        onClickUpdateTemplate={() => handleSaveTemplate()}
        onClickSubmit={() => resetTimer()}
        onClickSaveDOI={methods.handleSubmit(async data => handleDOISubmit(data as DoiFormDetails))}
        onClickCloseDialog={() => closeDialog()}
        onClickClearForm={() => handleClearForm()}
        onOpenXMLModal={() => handleXMLModalOpen()}
        onDeleteForm={() => handleDeleteForm()}
      />

      <Form
        id="hook-form"
        submittedStudy={submittedStudy}
        onChange={() => handleChange()}
        onSubmit={methods.handleSubmit(onSubmit)}
        ref={formRef as RefObject<HTMLFormElement>}
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
const WizardFillObjectDetailsForm = (props: { closeDialog?: () => void; formRef?: FormRef }) => {
  const { closeDialog, formRef } = props
  const dispatch = useAppDispatch()

  const objectType = useAppSelector(state => state.objectType)
  const submission = useAppSelector(state => state.submission)
  const currentObject = useAppSelector(state => state.currentObject)
  const locale = useAppSelector(state => state.locale)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

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
    setSubmitting(true)

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

      setSubmitting(false)
    }

    // Either patch object or submit a new object
    if (data.status === ObjectStatus.submitted) {
      patchObject()
    } else if ((objectType !== ObjectTypes.study)
      || (objectType === ObjectTypes.study
        && submission.metadataObjects.filter(object => object.schema === ObjectTypes.study).length === 0)) {
      submitObjectHook(data, submission.submissionId, objectType, dispatch)
        .then(() => {
          setSubmitting(false)
        })
        .catch(err => console.error(err))
    } else setSubmitting(false)
  }

  if (states.isLoading) return <CircularProgress />
  // Schema validation error differs from response status handler
  if (states.error)
    return (
      <CustomAlert severity="error" icon={<CancelIcon sx={{ fontSize: '2rem' }} />}>
        <AlertMessage>{states.helperText}</AlertMessage>
      </CustomAlert>
    )

  return (
    <>
      <GlobalStyles styles={{ ".MuiContainer-root": { maxWidth: "100% !important" } }} />
      <Container sx={{ m: 0, p: 0, width: "100%", boxSizing: "border-box" }} maxWidth={false}>
        <FormContent
          formSchema={states.formSchema as FormObject}
          resolver={WizardAjvResolver(states.validationSchema, locale)}
          onSubmit={onSubmit as SubmitHandler<FieldValues>}
          objectType={objectType}
          submission={submission}
          currentObject={currentObject}
          key={currentObject?.accessionId || submission.submissionId}
          closeDialog={closeDialog || (() => {})}
          formRef={formRef}
        />
        {submitting && <LinearProgress />}
        <WizardXMLUploadModal
          open={openedXMLModal}
          handleClose={() => {
            dispatch(resetXMLModalOpen())
          }}
        />
      </Container>
    </>
  )
}

export default WizardFillObjectDetailsForm
