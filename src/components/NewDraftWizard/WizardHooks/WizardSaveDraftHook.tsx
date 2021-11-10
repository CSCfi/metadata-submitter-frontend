import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addObjectToDrafts, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import type { FolderDetailsWithId } from "types"
import { getObjectDisplayTitle } from "utils"

type SaveDraftHookProps = {
  accessionId?: string
  objectType: string
  objectStatus: string
  folder: FolderDetailsWithId
  values: any
  dispatch: (reducer: any) => void
}

const saveDraftHook = async (props: SaveDraftHookProps) => {
  const { accessionId, objectType, objectStatus, folder, values, dispatch } = props

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
          status: ResponseStatus.success,
          response: response,
          helperText: "",
        })
      )
      dispatch(resetCurrentObject())
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Cannot save draft",
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
          status: ResponseStatus.success,
          response: response,
          helperText: "",
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
          status: ResponseStatus.error,
          response: response,
          helperText: "Cannot save draft",
        })
      )
    }
    dispatch(resetLoading())
    return response
  }
}

export default saveDraftHook
