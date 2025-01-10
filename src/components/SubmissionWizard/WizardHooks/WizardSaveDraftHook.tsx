import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { updateStatus } from "features/statusMessageSlice"
import { addDraftObject, replaceObjectInSubmission } from "features/wizardSubmissionSlice"
import draftAPIService from "services/draftAPI"
import type { SubmissionDetailsWithId, ObjectDisplayValues } from "types"
import { getObjectDisplayTitle } from "utils"

type SaveDraftHookProps = {
  accessionId?: string
  objectType: string
  objectStatus: string
  submission: SubmissionDetailsWithId
  values: Record<string, unknown>
  dispatch: (reducer: unknown) => void
}

const saveDraftHook = async (props: SaveDraftHookProps) => {
  const { accessionId, objectType, objectStatus, submission, values, dispatch } = props
  const draftDisplayTitle = getObjectDisplayTitle(objectType, values as ObjectDisplayValues)

  dispatch(setLoading())

  if (accessionId && objectStatus === ObjectStatus.draft) {
    const response = await draftAPIService.patchFromJSON(objectType, accessionId, values)

    if (response.ok) {
      dispatch(resetDraftStatus())
      dispatch(
        replaceObjectInSubmission(
          accessionId,
          { displayTitle: draftDisplayTitle, submissionType: ObjectSubmissionTypes.form },
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
    const response = await draftAPIService.createFromJSON(
      objectType,
      submission.submissionId,
      values
    )
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
        addDraftObject({
          accessionId: response.data.accessionId,
          schema: "draft-" + objectType,
          tags: { displayTitle: draftDisplayTitle, submissionType: ObjectSubmissionTypes.form },
        })
      )
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
