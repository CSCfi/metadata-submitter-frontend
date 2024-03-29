import { omit } from "lodash"

import { ResponseStatus } from "constants/responseStatus"
import { OmitObjectValues } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import draftAPIService from "services/draftAPI"
import templateAPIService from "services/templateAPI"
import { ObjectInsideSubmissionWithTags } from "types"
import { getOrigObjectType, getObjectDisplayTitle } from "utils"

const saveDraftsAsTemplates = async (
  projectId: string,
  formData: ObjectInsideSubmissionWithTags[],
  dispatch: (reducer: unknown) => void
) => {
  // Filter unique draft-schemas existing in formData
  const draftSchemas = formData
    .map((item: { schema: string }) => item.schema)
    .filter((val: string, ind: number, arr: string[]) => arr.indexOf(val) === ind)

  // Group the data according to their schemas aka objectTypes
  const groupedData = draftSchemas.map((draftSchema: string) => {
    const schema = getOrigObjectType(draftSchema)
    return {
      [schema]: formData.filter((el: { schema: string }) => el.schema === draftSchema),
    }
  })

  // Fetch drafts' values and add to draft templates based on their objectTypes
  for (let i = 0; i < groupedData.length; i += 1) {
    const objectType = Object.keys(groupedData[i])[0]
    const draftsByObjectType = groupedData[i][objectType]

    const draftsArr: Record<string, unknown>[] = []
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
        draftsArr.push({ projectId, template: { ...omit(draftResponse.data, OmitObjectValues) }, ...draftTags })
      } catch (err) {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: err,
            helperText: "Error when getting the drafts' details",
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
            status: ResponseStatus.error,
            response: err,
            helperText: "Cannot save selected draft(s) as template(s)",
          })
        )
      }
    }
  }
}

export default saveDraftsAsTemplates
