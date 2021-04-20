//@flow

import { useLocation } from "react-router-dom"

import { ObjectTypes } from "constants/wizardObject"
import type { ObjectInsideFolderWithTags } from "types"

export const getObjectDisplayTitle = (objectType: string, cleanedValues: any): string => {
  switch (objectType) {
    case ObjectTypes.study:
      return cleanedValues.descriptor?.studyTitle || ""
    case ObjectTypes.dac:
      return cleanedValues.contacts?.find(contact => contact.mainContact).name || ""
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
export const getDraftObjects = (drafts: Array<ObjectInsideFolderWithTags>, objectsArray: Array<string>): any => {
  const draftObjects = objectsArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = drafts.filter(draft => draft.schema.toLowerCase() === draftSchema.toLowerCase())
    return draftArray.length > 0 ? [{ [`draft-${schema}`]: draftArray }] : []
  })

  return draftObjects
}
