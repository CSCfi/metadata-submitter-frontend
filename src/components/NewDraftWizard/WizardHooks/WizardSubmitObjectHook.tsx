import JSONSchemaParser from "components/NewDraftWizard/WizardForms/WizardJSONSchemaParser"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setFileTypes } from "features/fileTypesSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addObject } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import { APIResponse, FormDataFiles, ObjectDisplayValues } from "types"
import { getObjectDisplayTitle, getNewUniqueFileTypes } from "utils"

const submitObjectHook = async (
  formData: Record<string, unknown>,
  folderId: string,
  objectType: string,
  dispatch: (reducer: unknown) => Promise<APIResponse>
): Promise<APIResponse> => {
  dispatch(setLoading())
  const waitForServertimer = setTimeout(() => {
    dispatch(
      updateStatus({
        status: ResponseStatus.info,
        helperText: "",
      })
    )
  }, 5000)

  const cleanedValues = JSONSchemaParser.cleanUpFormValues(formData)
  const response = await objectAPIService.createFromJSON(objectType, folderId, cleanedValues)

  if (response.ok) {
    const objectDisplayTitle = getObjectDisplayTitle(objectType, cleanedValues as ObjectDisplayValues)
    // Dispatch fileTypes if object is Run or Analysis
    if (objectType === ObjectTypes.run || objectType === ObjectTypes.analysis) {
      const objectWithFileTypes = getNewUniqueFileTypes(response.data.accessionId, formData as FormDataFiles)
      objectWithFileTypes ? dispatch(setFileTypes(objectWithFileTypes)) : null
    }

    dispatch(
      addObject({
        accessionId: response.data.accessionId,
        schema: objectType,
        tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: objectDisplayTitle },
      })
    )

    dispatch(
      updateStatus({
        status: ResponseStatus.success,
        response: response,
        helperText: "",
      })
    )
    dispatch(resetDraftStatus())
    dispatch(resetCurrentObject())
  } else {
    dispatch(
      updateStatus({
        status: ResponseStatus.error,
        response: response,
        helperText: "Validation failed",
      })
    )
  }

  clearTimeout(waitForServertimer)
  dispatch(resetLoading())

  return response
}

export default submitObjectHook
