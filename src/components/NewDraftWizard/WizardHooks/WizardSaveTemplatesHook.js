//@flow

import { omit } from "lodash"

import { OmitObjectValues } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { updateStatus } from "features/wizardStatusMessageSlice"
import draftAPIService from "services/draftAPI"
import templateAPIService from "services/templateAPI"
import { getOrigObjectType, getObjectDisplayTitle } from "utils"

const saveDraftsAsTemplates = async (formData: any, dispatch: any): any => {
  // Filter unique draft-schemas existing in formData
  const draftSchemas = formData.map(item => item.schema).filter((val, ind, arr) => arr.indexOf(val) === ind)

  // Group the data according to their schemas aka objectTypes
  const groupedData = draftSchemas.map(draftSchema => {
    const schema = getOrigObjectType(draftSchema)
    return {
      [schema]: formData.filter(el => el.schema === draftSchema),
    }
  })

  // Fetch drafts' values and add to draft templates based on their objectTypes
  for (let i = 0; i < groupedData.length; i += 1) {
    const objectType = Object.keys(groupedData[i])[0]
    const draftsByObjectType = groupedData[i][objectType]

    const draftsArr = []
    for (let j = 0; j < draftsByObjectType.length; j += 1) {
      try {
        // Fetch drafts' values
        const draftResponse = await draftAPIService.getObjectByAccessionId(
          objectType,
          draftsByObjectType[j].accessionId
        )
        // "tags" object to be added to JSONContent
        const draftTags = { tags: { displayTitle: getObjectDisplayTitle(objectType, draftResponse.data) } }

        // Remove unnecessary values such as "date"
        // Add the object in the form of {template: draft's values, tags: {displayTitle}} to the array
        draftsArr.push({ template: { ...omit(draftResponse.data, OmitObjectValues) }, ...draftTags })
      } catch (err) {
        dispatch(
          updateStatus({
            successStatus: WizardStatus.error,
            response: err,
            errorPrefix: "Error when getting the drafts' details",
          })
        )
      }
    }

    if (draftsArr.length > 0) {
      try {
        // POST selected drafts to save as templates based on the same objectType
        await templateAPIService.createTemplatesFromJSON(objectType, draftsArr)
      } catch (err) {
        dispatch(
          updateStatus({
            successStatus: WizardStatus.error,
            response: err,
            errorPrefix: "Cannot save selected draft(s) as template(s)",
          })
        )
      }
    }
  }
}

export default saveDraftsAsTemplates
