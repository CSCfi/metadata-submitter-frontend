/* metadataObjects is disabled for MVP */
import type { TFunction } from "i18next"

import { Namespaces } from "constants/translation"
import { ExtraObjectTypes, SDObjectTypes } from "constants/wizardObject"
import { STEP_CONTENT_KEYS } from "constants/wizardStepContent"
import { WorkflowTypes } from "constants/wizardWorkflow"
import type {
  StepObject,
  Schema,
  SubmissionDetailsWithId,
  Workflow,
  WorkflowStep,
  MappedSteps,
  SDSchemaName,
} from "types"
import { hasMetadata } from "utils"
/*
 * Map the structure of objects within a submission to separate steps in the Accordion
 */
const mapObjectsToStepsHook = (
  submission: SubmissionDetailsWithId,
  objects: StepObject[],
  objectTypesArray: Schema[],
  currentWorkflow: Workflow,
  t: TFunction,
  remsInfo: Record<string, unknown>[]
): { mappedSteps: MappedSteps[] } => {
  /*
   * List of accordion steps and configurations.
   * First step is always enabled.
   * Rest of the steps are visible after first step is saved.
   */
  const createSubmissionStep = {
    title: t("submission.datasetDetails"),
    schemas: [
      {
        objectType: ExtraObjectTypes.submissionDetails,
        name: t("newSubmission.nameSubmission"),
        objects: submission.submissionId
          ? [
              {
                id: submission.submissionId,
                displayTitle: submission.name,
              },
            ]
          : [],
        required: true,
        componentKey: STEP_CONTENT_KEYS.createSubmissionStep,
      },
    ],
  }

  const getRemsObject = () => {
    if (submission.rems) {
      const selectedRems = submission.rems
      const remsObj = remsInfo.reduce(
        (
          arr: { id: string | number; displayTitle: string }[],
          organization: Record<string, unknown>
        ) => {
          if (organization["id"] === selectedRems["organizationId"]) {
            const workflow = (organization["workflows"] as Record<string, unknown>[]).filter(
              wf => wf["id"] === selectedRems["workflowId"]
            )[0]
            arr.push({
              id: selectedRems["workflowId"],
              displayTitle: `${workflow["title"]} DAC`,
            })
            const numberOfLicenses = selectedRems["licenses"].length
            if (numberOfLicenses > 0) {
              arr.push({
                id: "",
                displayTitle:
                  numberOfLicenses > 1
                    ? `${numberOfLicenses} ${t("dacPolicies.policies")}`
                    : `1 ${t("dacPolicies.policy")}`,
              })
            }
          }
          return arr
        },
        []
      )
      return remsObj
    }
    return []
  }

  // Returns 'id' and 'displayTitle' for any saved objects
  const getSDSchemaObjects = (
    getTranslationKey: (key: string) => string,
    schemaName: SDSchemaName
  ) => {
    const { submissionId, bucket, metadata } = submission

    const schemaMap: Record<string, () => { id: string | number; displayTitle: string }[] | []> = {
      [SDObjectTypes.dacPolicies]: () => getRemsObject(),
      [SDObjectTypes.linkBucket]: () =>
        submissionId && bucket
          ? [
              {
                id: `linked-data-bucket-${submissionId}`,
                displayTitle: getTranslationKey(schemaName),
              },
            ]
          : [],
      [SDObjectTypes.publicMetadata]: () =>
        submissionId && hasMetadata(metadata)
          ? [
              {
                id: submissionId,
                displayTitle: getTranslationKey(schemaName),
              },
            ]
          : [],
      [SDObjectTypes.summary]: () => [],
      [SDObjectTypes.publishSubmission]: () => [],
    }

    return schemaMap[schemaName]?.() ?? []
  }

  const groupSchemaObjects = (
    getTranslationKey: (key: string) => string,
    schemaName: string
  ): { id: string | number; displayTitle: string }[] => {
    if (currentWorkflow.name == WorkflowTypes.sd)
      return getSDSchemaObjects(getTranslationKey, schemaName as SDSchemaName)
    else return []
  }

  const getSDStepComponents = (schemaName: string) => {
    const schemaMap: Record<string, () => string> = {
      [SDObjectTypes.dacPolicies]: () => STEP_CONTENT_KEYS.addObjectStep,
      [SDObjectTypes.linkBucket]: () => STEP_CONTENT_KEYS.dataBucketStep,
      [SDObjectTypes.publicMetadata]: () => STEP_CONTENT_KEYS.addObjectStep,
      [SDObjectTypes.summary]: () => STEP_CONTENT_KEYS.showSummaryStep,
      [SDObjectTypes.publishSubmission]: () => STEP_CONTENT_KEYS.publishSubmissionStep,
    }

    return schemaMap[schemaName]?.() ?? ""
  }

  const getStepComponents = (schemaName: string) => {
    if (currentWorkflow.name == WorkflowTypes.sd) return getSDStepComponents(schemaName)
    else return ""
  }

  const schemaSteps = currentWorkflow?.steps
    ? currentWorkflow.steps.map((step: WorkflowStep, index: number) => {
        const getTranslationKey = (key: string) =>
          t(`${currentWorkflow.name}.${index}.${key}`, { ns: Namespaces.workflowSteps })

        return {
          ...step,
          title: getTranslationKey(step.title),
          ["schemas"]: step.schemas.map(schema => ({
            ...schema,
            name: getTranslationKey(schema.name),
            objectType: schema.name,
            objects: groupSchemaObjects(getTranslationKey, schema.name),
            componentKey: getStepComponents(schema.name),
          })),
        }
      })
    : []

  const mappedSteps = [createSubmissionStep, ...(submission.submissionId ? schemaSteps : [])]

  return { mappedSteps }
}

export default mapObjectsToStepsHook
