//@flow
import JSONSchemaParser from "components/NewDraftWizard/WizardForms/WizardJSONSchemaParser"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { addObjectToFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import { getObjectDisplayTitle } from "utils"

const submitObjectHook = async (formData: any, folderId: string, objectType: string, dispatch: function): any => {
  dispatch(setLoading())
  const waitForServertimer = setTimeout(() => {
    dispatch(
      updateStatus({
        successStatus: WizardStatus.info,
        response: {},
        errorPrefix: "",
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
            successStatus: WizardStatus.success,
            response: response,
            errorPrefix: "",
          })
        )
        dispatch(resetDraftStatus())
        dispatch(resetCurrentObject())
      })
      .catch(error => {
        dispatch(
          updateStatus({
            successStatus: WizardStatus.error,
            response: error,
            errorPrefix: "Cannot connect to folder API",
          })
        )
      })
  } else {
    dispatch(
      updateStatus({
        successStatus: WizardStatus.error,
        response: response,
        errorPrefix: "Validation failed",
      })
    )
  }

  clearTimeout(waitForServertimer)
  dispatch(resetLoading())
  return response
}

export default submitObjectHook
