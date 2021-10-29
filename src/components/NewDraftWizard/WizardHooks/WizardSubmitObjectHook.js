//@flow
import JSONSchemaParser from "components/NewDraftWizard/WizardForms/WizardJSONSchemaParser"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addObjectToFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import { getObjectDisplayTitle } from "utils"

const submitObjectHook = async (formData: any, folderId: string, objectType: string, dispatch: function): any => {
  dispatch(setLoading())
  const waitForServertimer = setTimeout(() => {
    dispatch(
      updateStatus({
        status: ResponseStatus.info,
        response: {},
        helperText: "",
      })
    )
  }, 5000)

  const cleanedValues = JSONSchemaParser.cleanUpFormValues(formData)
  const response = await objectAPIService.createFromJSON(objectType, cleanedValues)

  if (response.ok) {
    const objectDisplayTitle = getObjectDisplayTitle(objectType, cleanedValues)

    dispatch(
      addObjectToFolder(folderId, {
        accessionId: response.data.accessionId,
        schema: objectType,
        tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: objectDisplayTitle },
      })
    )
      .then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            response: response,
            helperText: "",
          })
        )
        dispatch(resetDraftStatus())
        dispatch(resetCurrentObject())
      })
      .catch(error => {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "Cannot connect to folder API",
          })
        )
      })
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
