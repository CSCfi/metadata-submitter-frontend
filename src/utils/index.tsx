import { uniq } from "lodash"
import moment from "moment"
import { useLocation } from "react-router"

import { Locale } from "constants/translation"
import { FEGAObjectTypes } from "constants/wizardObject"
import type {
  File,
  FormDataFiles,
  ObjectDisplayValues,
  MetadataFormDetails,
  StepObject,
} from "types"

export const getObjectDisplayTitle = (
  objectType: string,
  objectData: Record<string, unknown>
): string => {
  const data = objectData as ObjectDisplayValues
  switch (objectType) {
    case FEGAObjectTypes.study:
      return data.descriptor?.studyTitle ?? ""
    default:
      return data.title ?? ""
  }
}

// Get Primary text for displaying item's title
export const getItemPrimaryText = (item: StepObject): string => {
  return item.displayTitle ? item.displayTitle : item.fileName ? item.fileName : ""
}

export const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search)
}

export const getAccessionIds = (objectType: string, objects?: StepObject[]): Array<string> => {
  if (objects) {
    const submissions = objects.filter(obj => obj.schema?.toLowerCase() === objectType)
    // SubmissionType Form: Add "- Title: " to accessionId, special case DAC form: add "- Main Contact:"
    // SubmissionType XML: Add "- File name: " to accessionId
    const accessionIds = submissions.map(obj => {
      const accessionId = obj.id
      const displayTitle = obj.displayTitle || ""
      let label = "Title"
      if (obj.schema === FEGAObjectTypes.dac) label = "Main Contact"
      if (obj.isXML) label = "File name"
      return `${accessionId} - ${label}: ${displayTitle}`
    })
    return accessionIds
  }
  return []
}

export const getOrigObjectType = (schema: string): string => {
  const objectType = schema.slice(schema.indexOf("-") + 1)
  return objectType
}

// Create localized path
// Using useSelector hook causes rendering errors and local storage is used instead
export const pathWithLocale = (path: string): string => {
  const locale = localStorage.getItem("locale") || Locale.defaultLocale

  return `/${locale}/${path}`
}

// Get unique "fileTypes" from Run form or Analysis form
export const getNewUniqueFileTypes = (
  objectAccessionId: string | null,
  formData: FormDataFiles
): { accessionId: string; fileTypes: string[] } | null => {
  if (formData.files?.length > 0 && objectAccessionId) {
    // Get unique fileTypes from current objectType and Add the new unique types fileTypes state in Redux
    const fileTypes = uniq(formData.files.map((file: { filetype: string }) => file.filetype))
    const objectWithFileTypes = { accessionId: objectAccessionId, fileTypes }
    return objectWithFileTypes
  }
  return null
}

// Convert Unix timestamp to Date
export const getConvertedDate = (timestamp: number): string => {
  const convertedDate = !isNaN(timestamp) ? moment.unix(timestamp).format("DD MMM, YYYY") : ""
  return convertedDate
}

// Check if it's a file or a folder (current path equals original file path)
export const isFile = (files: File[], path: string) =>
  files.findIndex(file => file.path === path) > -1

// Check that submission's metadata exist and that it contains data at least at one of the keys
export const hasMetadata = (metadata: MetadataFormDetails | undefined): boolean => {
  return !!metadata && Object.values(metadata).some(item => Array.isArray(item) && item.length)
}

export const removeWhitespace = (item: string): string => {
  return item.replace(/\s+/g, "")
}
