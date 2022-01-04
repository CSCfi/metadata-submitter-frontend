import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import draftAPIService from "services/draftAPI"
import templateAPIService from "services/templateAPI"
import type { ObjectInsideFolder, ObjectInsideFolderWithTags } from "types"
import { getObjectDisplayTitle, getOrigObjectType } from "utils"

const transformTemplatesToDrafts = async (
  templateAccessionIds: Array<string>,
  templates: Array<ObjectInsideFolder>,
  dispatch: (dispatch: (reducer: any) => void) => void
): Promise<Array<ObjectInsideFolderWithTags>> => {
  const userTemplates = templates.map(template => ({
    ...template,
    schema: getOrigObjectType(template.schema),
  }))

  const templateDetails = userTemplates?.filter(item => templateAccessionIds.includes(item.accessionId))

  const draftsArray = [] as any
  for (let i = 0; i < templateDetails.length; i += 1) {
    try {
      // Get full details of template
      const templateResponse = await templateAPIService.getTemplateByAccessionId(
        templateDetails[i].schema,
        templateDetails[i].accessionId
      )
      // Create a draft based on the selected template
      const draftResponse = await draftAPIService.createFromJSON(templateDetails[i].schema, templateResponse.data)

      // Draft details to be added when creating a new folder
      const draftDetails = {
        accessionId: draftResponse.data.accessionId,
        schema: "draft-" + templateDetails[i].schema,
        tags: { displayTitle: getObjectDisplayTitle(templateDetails[i].schema, templateResponse.data) },
      }
      draftsArray.push(draftDetails)
    } catch (error) {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: error,
          helperText: "Error fetching the template(s)",
        })
      )
    }
  }
  return draftsArray
}

export default transformTemplatesToDrafts
