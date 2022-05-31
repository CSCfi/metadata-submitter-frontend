import { NavigateFunction } from "react-router-dom"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { setFocus } from "features/focusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject, setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import type { APIResponse, ObjectInsideSubmissionWithTags } from "types"
import { pathWithLocale } from "utils"

const editObjectHook = async (
  draft: boolean,
  objectType: string,
  item: ObjectInsideSubmissionWithTags,
  step: number,
  submissionId: string,
  dispatch: (reducer: unknown) => Promise<APIResponse>,
  navigate: NavigateFunction,
  index?: number
) => {
  const service = draft ? draftAPIService : objectAPIService

  const response = await service.getObjectByAccessionId(objectType, item.accessionId)
  const pathname = pathWithLocale(`submission/${submissionId}`)

  if (response.ok) {
    dispatch(setSubmissionType(ObjectSubmissionTypes.form))
    dispatch(setObjectType(objectType))
    dispatch(resetCurrentObject())
    dispatch(
      setCurrentObject({
        ...response.data,
        status: draft ? ObjectStatus.draft : ObjectStatus.submitted,
        ...(!draft && { tags: item.tags }),
        ...(!draft && { index: index }),
      })
    )
    dispatch(setFocus())
    navigate({ pathname: pathname, search: `step=${step}` })
  } else {
    dispatch(
      updateStatus({
        status: ResponseStatus.error,
        response: response,
        helperText: `Error while fetching${draft && " draft"} object`,
      })
    )
  }
  return response
}

export default editObjectHook
