//@flow

import { ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToDrafts, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import type { FolderDetailsWithId } from "types"
import { getObjectDisplayTitle } from "utils"

const saveDraftHook = async (
  accessionId?: string,
  objectType: string,
  objectStatus: string,
  folder: FolderDetailsWithId,
  values: any,
  dispatch: function
): any => {
  const draftDisplayTitle = getObjectDisplayTitle(objectType, values)
  dispatch(setLoading())
  if (accessionId && objectStatus === ObjectStatus.draft) {
    const response = await draftAPIService.patchFromJSON(objectType, accessionId, values)
    const index = folder.drafts.findIndex(item => item.accessionId === accessionId)
    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        replaceObjectInFolder(
          folder.folderId,
          accessionId,
          index,
          { displayTitle: draftDisplayTitle },
          ObjectStatus.draft
        )
      )
      dispatch(
        updateStatus({
          successStatus: WizardStatus.success,
          response: response,
          errorPrefix: "",
        })
      )
      dispatch(resetCurrentObject())
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Cannot save draft",
        })
      )
    }
    dispatch(resetLoading())
    return response
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
        addObjectToDrafts(folder.folderId, {
          accessionId: response.data.accessionId,
          schema: "draft-" + objectType,
          tags: { displayTitle: draftDisplayTitle },
        })
      )
      dispatch(resetCurrentObject())
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Cannot save draft",
        })
      )
    }
    dispatch(resetLoading())
    return response
  }
}

export default saveDraftHook
