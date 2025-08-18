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
  projects: { projectId: string }[]
}

export type Schema =
  | "study"
  | "dac"
  | "policy"
  | "sample"
  | "experiment"
  | "run"
  | "analysis"
  | "dataset"

export type Workflow = {
  name: string
  description: string
  steps: WorkflowStep[]
  publish: WorkflowPublish[]
}

export type WorkflowStep = {
  required: boolean
  title: string
  schemas: WorkflowSchema[]
}

export type WorkflowSchema = {
  name: string
  required: boolean
  allowMultipleObjects: boolean
}

export type WorkflowPublish = {
  publish: {
    name: string
    endpoint: string
    requiredSchemas?: string[]
    required?: string[]
  }
}

export type MappedSteps = {
  title: string
  schemas?: {
    name: string
    objectType: string
    objects: StepObject[] | []
    title?: string
    required?: boolean
    allowMultipleObjects?: boolean
  }[]
  required?: boolean
}

// Type of object shown in Accordion step
export type StepObject = {
  id: string | number
  displayTitle: string
  submissionId?: string
  schema?: string
  fileName?: string // Used for XML
  isXML?: boolean
  objectData?: ObjectInsideSubmission // to be removed when modifying WizardSummaryPage
}

// Type of current object shown in a form
export type CurrentFormObject = {
  accessionId: string
  [key: string]: unknown
  cleanedValues?: CurrentFormObject
}

export type OldSubmissionRow = CurrentFormObject & {
  objectData: Record<string, unknown>
}

export type ObjectInsideSubmission = {
  accessionId: string
  schema: string
}

export type SubmissionId = {
  submissionId: string
}

export type SubmissionDetails = {
  name: string
  description: string
  workflow: string
  dateCreated?: number
  published: boolean
  allObjects?: Array<CurrentFormObject>
}

export type SubmissionDetailsWithId = SubmissionId & SubmissionDetails

export type SubmissionRow = {
  id: string
  name: string
  dateCreated?: number
  lastModifiedBy: string
  submissionType: string
}

export type SubmissionDataFromForm = {
  name: string
  description: string
  workflowType: string
}

export type SubmissionFolder = SubmissionDetailsWithId & { doiInfo: DoiFormDetails } & {
  rems?: RemsDetails
}

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

export type ConnectFormChildren = {
  children: (...args: ConnectFormMethods[]) => React.ReactElement<unknown>
}

export type NestedField = {
  id: string
  fieldValues: string
}

// ApiSauce uses "any" as argument for response type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APIResponse = ApiResponse<any>

export type ObjectDisplayValues = {
  descriptor?: { studyTitle?: string }
  title?: string
}

/*
  Used to get unique file types when patching or submitting Run or Analysis objects.
  These file types are needed for Datacite's form
*/
export type FormDataFiles = { files: { filetype: string }[] }

export type DoiCreator = {
  givenName: string | undefined
  familyName: string | undefined
  name: string | undefined
}

export type DoiContributor = DoiCreator & { contributorType: string }

export type DoiSubject = { subject: string }

export type DoiFormDetails = {
  creators: DoiCreator[]
  contributors: DoiContributor[]
  subjects: DoiSubject[]
  keywords: string
}

export type RemsDetails = {
  organizationId: string
  workflowId: number
  licenses: number[]
}

export type DataFolderRow = {
  id: string | number
  name?: string
  size?: number
  items?: number
  tags?: string
}

export type File = {
  id: string
  path: string
  name: string
  bytes: number
  lastModified?: string
}

export type DataFileRow = {
  id: string
  name: string
  size: number
  lastModified: string
  tags?: string
}

export type DacPoliciesData = {
  organizationId: string
  workflowId: number
  licences: number[]
}

// Used in feature slices
export type DispatchReducer = { payload: unknown; type: string }

export type HandlerRef =
  | { current: HTMLElement | null }
  | React.RefObject<HTMLFormElement | null>
  | React.RefObject<HTMLDivElement | null>
  | null
  | undefined
