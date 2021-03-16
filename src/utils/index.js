//@flow

import { ObjectTypes } from "constants/wizardObject"
import type { ObjectInsideFolderWithTags } from "types"

export const getObjectDisplayTitle = (objectType: string, cleanedValues: any): string => {
  switch (objectType) {
    case ObjectTypes.study:
      return cleanedValues.descriptor.studyTitle
    case ObjectTypes.dac:
      return cleanedValues.contacts.find(contact => contact.mainContact).name
    default:
      return cleanedValues.title
  }
}

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
