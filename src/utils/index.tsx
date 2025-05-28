import { uniq } from "lodash"
import moment from "moment"
import { useLocation } from "react-router"

import { Locale } from "constants/locale"
import { ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import type {
  File,
  FormDataFiles,
  ObjectDisplayValues,
  ObjectInsideSubmissionWithTags,
  SubmissionDetailsWithId,
  DoiFormDetails,
} from "types"

export const getObjectDisplayTitle = (
  objectType: string,
  cleanedValues: ObjectDisplayValues
): string => {
  switch (objectType) {
    case ObjectTypes.study:
      return cleanedValues.descriptor?.studyTitle || ""
    default:
      return cleanedValues.title || ""
  }
}

// Get Primary text for displaying item's title
export const getItemPrimaryText = (item: ObjectInsideSubmissionWithTags): string => {
  if (item.tags?.displayTitle) {
    return item.tags.displayTitle
  } else if (item.tags?.fileName) {
    return item.tags.fileName
  }
  return ""
}

export const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search)
}

export const formatDisplayObjectType = (objectType: string): string => {
  if (objectType === ObjectTypes.dac) {
    return `${objectType.toUpperCase()}`
  } else if (objectType === `draft-${ObjectTypes.dac}`) {
    const hyphenIndex = objectType.indexOf("-")
    return `draft-${objectType.slice(hyphenIndex + 1).toUpperCase()}`
  } else {
    return `${objectType.charAt(0).toUpperCase()}${objectType.slice(1)}`
  }
}

// draftObjects contains an array of objects and each has a schema and the related draft(s) array if there is any
export const getDraftObjects = (
  drafts: Array<ObjectInsideSubmissionWithTags>,
  objectTypesArray: Array<string>
): { [draftObjectType: string]: ObjectInsideSubmissionWithTags[] }[] => {
  const draftObjects = objectTypesArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = drafts.filter(
      draft => draft.schema.toLowerCase() === draftSchema.toLowerCase()
    )
    return draftArray.length > 0 ? [{ [draftSchema]: draftArray }] : []
  })

  return draftObjects
}

export const getAccessionIds = (
  objectType: string,
  metadataObjects?: Array<ObjectInsideSubmissionWithTags>
): Array<string> => {
  if (metadataObjects) {
    const submissions = metadataObjects.filter(obj => obj.schema.toLowerCase() === objectType)
    // SubmissionType Form: Add "- Title: " to accessionId, special case DAC form: add "- Main Contact:"
    // SubmissionType XML: Add "- File name: " to accessionId
    const accessionIds = submissions.map(obj => {
      const accessionId = obj.accessionId
      const displayTitle = obj.tags?.displayTitle || ""
      return obj.schema === ObjectTypes.dac
        ? `${accessionId} - Main Contact: ${displayTitle}`
        : obj.tags?.submissionType === ObjectSubmissionTypes.xml
          ? `${accessionId} - File name: ${displayTitle}`
          : `${accessionId} - Title: ${displayTitle}`
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

// Check if it's a file or a subfolder (current path equals original file path)
export const isFile = (files: File[], path: string) =>
  files.findIndex(file => file.path === path) > -1

// Check if submission contains draft or submitted objects of a specific schema/objectType
export const checkObjectStatus = (submission: SubmissionDetailsWithId, objectType: string) => {
  const hasDraftObject: boolean =
    submission.drafts.filter(object => object.schema === `draft-${objectType}`).length > 0
  const hasSubmittedObject: boolean =
    submission.metadataObjects.filter(object => object.schema === objectType).length > 0
  return { hasDraftObject, hasSubmittedObject }
}

// Check that doiInfo exist and that it contains data at least at one of the keys
export const hasDoiInfo = (doi: DoiFormDetails): boolean => {
  const retval = doi
    ? Object.values(doi).filter(item => Array.isArray(item) && item.length > 0).length > 0
    : false
  return retval
}
