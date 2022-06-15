import { ApiResponse } from "apisauce"
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  UseFormGetValues,
  Control,
  UseFormSetValue,
  UseFormReset,
  UseFormUnregister,
  FormState,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form"

export type User = {
  id: string
  name: string
  projects: Array<{ projectId: string; projectNumber: string }>
}

export type Schema = "study" | "dac" | "policy" | "sample" | "experiment" | "run" | "analysis" | "dataset"

export type StepItemObject = { id: string; displayTitle: string; objectData?: ObjectInsideSubmissionWithTags }

export type StepObject = {
  label: string
  stepItems?: {
    objectType: string
    label: string
    objects?: { ready?: StepItemObject[]; drafts?: StepItemObject[] }
  }[]
  actionButtonText?: string
  disabled?: boolean
}

export type ObjectDetails = {
  accessionId: string
  lastModified: string
  objectType: string
  status: string
  title: string
  submissionType: string
}

export type OldSubmissionRow = ObjectDetails & { objectData: Record<string, unknown>; submissionType?: string }

export type ObjectInsideSubmission = {
  accessionId: string
  schema: string
}

export type ObjectTags = {
  submissionType?: string
  fileName?: string
  fileSize?: string
  displayTitle?: string
}

export type ObjectInsideSubmissionWithTags = ObjectInsideSubmission & { tags: ObjectTags }

export type ObjectInsideSubmissionWithTagsBySchema = { [schema: string]: ObjectInsideSubmissionWithTags[] }

export type SubmissionId = {
  submissionId: string
}

export type ObjectInsideSubmissionWithTagsBySchemaAndStatus = {
  [schema: string]: { drafts: ObjectInsideSubmissionWithTags[]; ready: ObjectInsideSubmissionWithTags[] }
}

export type SubmissionDetails = {
  name: string
  description: string
  dateCreated?: number
  published: boolean
  drafts: Array<ObjectInsideSubmissionWithTags>
  metadataObjects: Array<ObjectInsideSubmissionWithTags>
  allObjects?: Array<ObjectDetails>
}

export type SubmissionDetailsWithId = SubmissionId & SubmissionDetails

export type SubmissionRow = {
  id: string
  name: string
  dateCreated?: number
  lastModifiedBy: string
}

export type SubmissionDataFromForm = {
  name: string
  description: string
}

export type SubmissionFolder = SubmissionDetailsWithId & { doiInfo: DoiFormDetails }
export type FormRef = { current: HTMLElement | null } | undefined

export type StatusDetails = {
  status: string | null
  response?: unknown
  helperText?: string
}

export type FormObject = {
  $id: string
  type: string
  title: string
  description: string
  oneOf: FormObject[]
  enum: string[]
  properties: Record<string, unknown>
  items: FormObject
  else: FormObject
  contains: { allOf: FormObject[] }
  minimum: number
  minLength: number
  required: string[]
}

export type ConnectFormMethods = {
  watch: UseFormWatch<FieldValues>
  getValues: UseFormGetValues<FieldValues>
  setError: UseFormSetError<FieldValues>
  clearErrors: UseFormClearErrors<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  trigger: UseFormTrigger<FieldValues>
  formState: FormState<FieldValues>
  resetField: UseFormResetField<FieldValues>
  reset: UseFormReset<FieldValues>
  handleSubmit: UseFormHandleSubmit<FieldValues>
  unregister: UseFormUnregister<FieldValues>
  control: Control<FieldValues, object>
  register: UseFormRegister<FieldValues>
  setFocus: UseFormSetFocus<FieldValues>
  errors?: FieldErrors
}

export type ConnectFormChildren = { children: (...args: ConnectFormMethods[]) => React.ReactElement }

export type NestedField = {
  id: string
  fieldValues: string
}

// ApiSauce uses "any" as argument for response type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APIResponse = ApiResponse<any>

export type ObjectDisplayValues = {
  descriptor: { studyTitle: string }
  contacts: { name: string; mainContact: boolean }[]
  title: string
}

// Used to get unique file types when patching or submitting Run or Analysis objects
export type FormDataFiles = { files: { filetype: string }[] }

export type DoiCreator = { givenName: string | undefined; familyName: string | undefined; name: string | undefined }

export type DoiContributor = DoiCreator & { contributorType: string }

export type DoiSubject = { subject: string }

export type DoiFormDetails = { creators: DoiCreator[]; contributors: DoiContributor[]; subjects: DoiSubject[] }

// Used in feature slices
export type DispatchReducer = { payload: unknown; type: string }
