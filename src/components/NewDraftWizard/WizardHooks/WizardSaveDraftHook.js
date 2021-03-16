//@flow
import { ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetDraftStatus } from "features/draftStatusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToDrafts } from "features/wizardSubmissionFolderSlice"
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
  if (accessionId && objectStatus === ObjectStatus.draft) {
    const response = await draftAPIService.patchFromJSON(objectType, accessionId, values)
    if (response.ok) {
      dispatch(resetDraftStatus())
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
      const draftDisplayTitle = getObjectDisplayTitle(objectType, values)
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
