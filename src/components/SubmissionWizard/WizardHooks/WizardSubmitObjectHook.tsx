import JSONSchemaParser from "components/SubmissionWizard/WizardForms/WizardJSONSchemaParser"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectTypes } from "constants/wizardObject"
import { setFileTypes } from "features/fileTypesSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { updateStatus } from "features/statusMessageSlice"
import { upsertObject } from "features/stepObjectSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import objectAPIService from "services/objectAPI"
import { APIResponse, FormDataFiles, ObjectDisplayValues } from "types"
import { getObjectDisplayTitle, getNewUniqueFileTypes } from "utils"

const submitObjectHook = async (
  formData: Record<string, unknown>,
  submissionId: string,
  objectType: string,
  dispatch: (reducer: unknown) => Promise<APIResponse>
): Promise<void> => {
  dispatch(setLoading())

  const cleanedValues = JSONSchemaParser.cleanUpFormValues(formData)
  let response

  try {
    if (cleanedValues.accessionId) {
      response = await objectAPIService.patchFromJSON(
        objectType,
        cleanedValues.accessionId as string,
        cleanedValues
      )
    } else {
      response = await objectAPIService.createFromJSON(objectType, submissionId, cleanedValues)
    }

    const objectDisplayTitle = getObjectDisplayTitle(
      objectType,
      cleanedValues as ObjectDisplayValues
    )

    const objAccessionId = Array.isArray(response.data)
      ? response.data[0].accessionId
      : response.data.accessionId

    dispatch(
      upsertObject({
        id: objAccessionId,
        submissionId,
        schema: objectType,
        displayTitle: objectDisplayTitle,
      })
    )

    // Dispatch fileTypes if object is Run or Analysis
    if (objectType === ObjectTypes.run || objectType === ObjectTypes.analysis) {
      const objectWithFileTypes = getNewUniqueFileTypes(
        response.data.accessionId,
        cleanedValues as FormDataFiles
      )
      objectWithFileTypes ? dispatch(setFileTypes(objectWithFileTypes)) : null
    }

    const currentObject = Array.isArray(response.data) ? response.data[0] : response.data
    dispatch(setCurrentObject(currentObject))

    dispatch(
      updateStatus({
        status: ResponseStatus.success,
        response: response,
        helperText: "",
      })
    )
  } catch (error) {
    dispatch(
      updateStatus({
        status: ResponseStatus.error,
        response: error,
        helperText: "snackbarMessages.error.helperText.validation",
      })
    )
  }

  dispatch(resetLoading())
}

export default submitObjectHook
