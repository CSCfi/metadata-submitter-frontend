//@flow
import { ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetDraftStatus } from "features/draftStatusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToDrafts, modifyDraftObjectTags } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import { getObjectDisplayTitle } from "utils"

const saveDraftHook = async (
  accessionId?: string,
  objectType: string,
  objectStatus: string,
  folderId: string,
  values: any,
  dispatch: function
): any => {
  const draftDisplayTitle = getObjectDisplayTitle(objectType, values)
  if (accessionId && objectStatus === ObjectStatus.draft) {
    const response = await draftAPIService.patchFromJSON(objectType, accessionId, values)
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        modifyDraftObjectTags({
          accessionId,
          tags: {
            displayTitle: draftDisplayTitle,
          },
        })
      )
      dispatch(
        updateStatus({
          successStatus: WizardStatus.success,
          response: response,
          errorPrefix: "",
        })
      )
      dispatch(resetCurrentObject())

      return response
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Cannot save draft",
        })
      )
      return response
    }
  } else {
    const response = await draftAPIService.createFromJSON(objectType, values)
    if (response.ok) {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.success,
          response: response,
          errorPrefix: "",
        })
      )
      dispatch(resetDraftStatus())
      dispatch(
        addObjectToDrafts(folderId, {
          accessionId: response.data.accessionId,
          schema: "draft-" + objectType,
          tags: { displayTitle: draftDisplayTitle },
        })
      )
      dispatch(resetCurrentObject())

      return response
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Cannot save draft",
        })
      )
      return response
    }
  }
}

export default saveDraftHook
