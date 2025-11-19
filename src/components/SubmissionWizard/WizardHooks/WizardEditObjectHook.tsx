import { NavigateFunction } from "react-router"

import { ResponseStatus } from "constants/responseStatus"
import { setFocus } from "features/focusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject, setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import submissionAPIService from "services/submissionAPI"
import type { APIResponse, StepObject } from "types"
import { pathWithLocale } from "utils"

/*
 * Fetch an object based on its schema and accessionId, 
  and set the correct object to display in the UI
 */
const editObjectHook = async (
  objectType: string,
  item: StepObject,
  step: number,
  submissionId: string,
  dispatch: (reducer: unknown) => Promise<APIResponse>,
  navigate: NavigateFunction
) => {
  const response = await submissionAPIService.getObjectByObjectId(
    submissionId,
    objectType,
    item.id as string
  )
  const pathname = pathWithLocale(`submission/${submissionId}`)

  if (response.ok) {
    dispatch(setObjectType(objectType))
    dispatch(resetCurrentObject())
    dispatch(setCurrentObject({ ...response.data }))
    dispatch(setFocus())
    navigate({ pathname: pathname, search: `step=${step}` })
  } else {
    dispatch(
      updateStatus({
        status: ResponseStatus.error,
        response: response,
        helperText: "snackbarMessages.error.helperText.fetchObject",
      })
    )
  }
  return response
}

export default editObjectHook
