import { uniq } from "lodash"
import moment from "moment"
import { useLocation } from "react-router-dom"

import { Locale } from "constants/locale"
import { ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import type { FormDataFiles, ObjectDisplayValues, ObjectInsideFolderWithTags } from "types"

export const getObjectDisplayTitle = (objectType: string, cleanedValues: ObjectDisplayValues): string => {
  switch (objectType) {
    case ObjectTypes.study:
      return cleanedValues.descriptor?.studyTitle || ""
    case ObjectTypes.dac:
      return cleanedValues.contacts?.find(contact => contact.mainContact)?.name || ""
    default:
      return cleanedValues.title || ""
  }
}

// Get Primary text for displaying item's title
export const getItemPrimaryText = (item: ObjectInsideFolderWithTags): string => {
  if (item.tags?.displayTitle) {
    switch (item.schema) {
      case ObjectTypes.dac:
      case `draft-${ObjectTypes.dac}`:
        return `Main Contact: ${item.tags.displayTitle}`
      default:
        return item.tags.displayTitle
    }
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
  drafts: Array<ObjectInsideFolderWithTags>,
  objectTypesArray: Array<string>
): { [draftObjectType: string]: ObjectInsideFolderWithTags[] }[] => {
  const draftObjects = objectTypesArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = drafts.filter(draft => draft.schema.toLowerCase() === draftSchema.toLowerCase())
    return draftArray.length > 0 ? [{ [draftSchema]: draftArray }] : []
  })

  return draftObjects
}

export const getUserTemplates = (
  templates: Array<ObjectInsideFolderWithTags>,
  objectTypesArray: Array<string>
): { [templateObjectType: string]: ObjectInsideFolderWithTags[] }[] => {
  const userTemplates = objectTypesArray.flatMap((schema: string) => {
    const templateSchema = `template-${schema}`
    const templatesArray = templates.filter(template => template.schema.toLowerCase() === templateSchema.toLowerCase())
    return templatesArray.length > 0 ? [{ [templateSchema]: templatesArray }] : []
  })

  return userTemplates
}

export const getAccessionIds = (
  objectType: string,
  metadataObjects?: Array<ObjectInsideFolderWithTags>
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
