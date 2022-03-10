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

export type Schema = "study" | "sample" | "experiment" | "run" | "analysis" | "dac" | "policy" | "dataset"

export type ObjectDetails = {
  accessionId: string
  lastModified: string
  objectType: string
  status: string
  title: string
  submissionType: string
}

export type OldFolderRow = ObjectDetails & { objectData: Record<string, unknown>; folderType?: string }

export type ObjectInsideFolder = {
  accessionId: string
  schema: string
}

export type ObjectTags = {
  submissionType?: string
  fileName?: string
  displayTitle?: string
}

export type ObjectInsideFolderWithTags = ObjectInsideFolder & { tags: ObjectTags }

export type ObjectInsideFolderWithTagsBySchema = { [schema: string]: ObjectInsideFolderWithTags[] }

export type FolderId = {
  folderId: string
}

export type FolderDetails = {
  name: string
  description: string
  dateCreated?: number
  published: boolean
  drafts: Array<ObjectInsideFolderWithTags>
  metadataObjects: Array<ObjectInsideFolderWithTags>
  allObjects?: Array<ObjectDetails>
}

export type FolderDetailsWithId = FolderId & FolderDetails

export type FolderRow = {
  id: string
  name: string
  dateCreated?: number
  lastModifiedBy: string
  cscProject: string
}

export type FolderDataFromForm = {
  name: string
  description: string
}

export type CreateFolderFormRef = { current: HTMLElement | null } | undefined

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
  fieldValues: Record<string, unknown>
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
