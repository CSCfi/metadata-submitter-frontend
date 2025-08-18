import type { TFunction } from "i18next"
import { startCase } from "lodash"

import { ObjectTypes } from "constants/wizardObject"
import { WorkflowTypes } from "constants/wizardWorkflow"
import type {
  StepObject,
  Schema,
  SubmissionFolder,
  Workflow,
  WorkflowStep,
  MappedSteps,
} from "types"
import { hasDoiInfo } from "utils"

/*
 * Map the structure of objects within a submission to separate steps in the Accordion
 */
const mapObjectsToStepsHook = (
  submission: SubmissionFolder,
  objects: StepObject[],
  objectTypesArray: Schema[],
  currentWorkflow: Workflow | Record<string, unknown>,
  t: TFunction,
  remsInfo: Record<string, unknown>[]
): { mappedSteps: MappedSteps[] } => {
  // Group objects by schema
  const groupedObjects = objectTypesArray
    .map((schema: Schema) => {
      return {
        [schema]: objects.filter(obj => obj.schema === schema),
      }
    })
    .reduce((map, obj) => {
      const key = Object.keys(obj)[0]
      map[key] = obj[key]
      return map
    }, {})

  const allSteps: WorkflowStep[] = currentWorkflow?.steps as WorkflowStep[]
  const workflowSteps = allSteps?.filter(step => step.title.toLowerCase() !== ObjectTypes.datacite)

  const schemaSteps =
    workflowSteps?.length > 0
      ? workflowSteps.map((step: WorkflowStep) => {
          return {
            ...step,
            title: step.title.toLowerCase().includes(ObjectTypes.file)
              ? t("datafolder.datafolder")
              : step.title,
            ["schemas"]: step.schemas.map(schema => ({
              ...schema,
              name: schema.name.toLowerCase().includes(ObjectTypes.file)
                ? t("datafolder.datafolder")
                : schema.name === ObjectTypes.dac
                  ? schema.name.toUpperCase()
                  : startCase(schema.name),
              objectType: schema.name,
              objects: groupedObjects[schema.name],
            })),
          }
        })
      : []

  /*
   * List of accordion steps and configurations.
   * First step is always enabled.
   * Rest of the steps are visiblef after first step is saved.
   */
  const createSubmissionStep = {
    title: t("submission.details"),
    schemas: [
      {
        objectType: "submissionDetails",
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
      },
    ],
  }

  const getRemsObject = () => {
    if (submission.rems) {
      const selectedRems = submission.rems
      const remsObj = remsInfo.reduce(
        (
          arr: { id: number | string; displayTitle: string }[],
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

  const dacPoliciesStep = {
    title: t("dacPolicies.title"),
    schemas: [
      {
        objectType: "dacPolicies",
        name: t("dacPolicies.title"),
        objects: getRemsObject(),
        required: true,
      },
    ],
  }

  /*
   * Add to the "Identifier and publish" step of accordion the summary and publish substeps
   */

  const hasDoi: boolean = hasDoiInfo(submission.doiInfo)

  const idPublishStep = {
    title: t("identifierPublish"),
    schemas: [
      {
        name: t("identifier"),
        objectType: ObjectTypes.datacite,
        objects: hasDoi
          ? [
              {
                id: submission.submissionId,
                displayTitle: t("doiRegistrationInfo"),
              },
            ]
          : [],
        required: true,
      },
      {
        name: t("summary"),
        objectType: t("summary"),
        objects: [],
        required: true,
      },
      {
        name: t("publishSubmission"),
        objectType: t("summaryPage.publish"),
        objects: [],
        required: true,
      },
    ],
  }

  const mappedSteps = (
    currentWorkflow?.name === WorkflowTypes.sdsx
      ? [createSubmissionStep, dacPoliciesStep]
      : [createSubmissionStep]
  ).concat(schemaSteps)

  if (submission.name !== "") mappedSteps.push(idPublishStep)

  return { mappedSteps }
}

export default mapObjectsToStepsHook
