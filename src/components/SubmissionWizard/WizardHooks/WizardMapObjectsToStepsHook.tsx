/* metadataObjects is disabled for MVP */
import type { TFunction } from "i18next"
//import { startCase } from "lodash"

import { ObjectTypes } from "constants/wizardObject"
//import { WorkflowTypes } from "constants/wizardWorkflow"
import type {
  StepObject,
  Schema,
  Submission,
  Workflow,
  // WorkflowStep,
  MappedSteps,
} from "types"
import { hasDoiInfo } from "utils"

/*
 * Map the structure of objects within a submission to separate steps in the Accordion
 */
const mapObjectsToStepsHook = (
  submission: Submission,
  objects: StepObject[],
  objectTypesArray: Schema[],
  currentWorkflow: Workflow | Record<string, unknown>,
  t: TFunction,
  remsInfo: Record<string, unknown>[]
): { mappedSteps: MappedSteps[] } => {
  // Group objects by schema
  // const groupedObjects = objectTypesArray
  //   .map((schema: Schema) => {
  //     return {
  //       [schema]: objects.filter(obj => obj.schema === schema),
  //     }
  //   })
  //   .reduce((map, obj) => {
  //     const key = Object.keys(obj)[0]
  //     map[key] = obj[key]
  //     return map
  //   }, {})

  // const allSteps: WorkflowStep[] = currentWorkflow?.steps as WorkflowStep[]

  // const schemaSteps =
  //   allSteps?.length > 0
  //     ? allSteps.map((step: WorkflowStep) => {
  //         return {
  //           ...step,
  //           ["schemas"]: step.schemas.map(schema => ({
  //             ...schema,
  //             name:
  //               schema.name === ObjectTypes.dac
  //                 ? schema.name.toUpperCase()
  //                 : startCase(schema.name),
  //             objectType: schema.name,
  //             objects: groupedObjects[schema.name],
  //           })),
  //         }
  //       })
  //     : []

  /*
   * List of accordion steps and configurations.
   * First step is always enabled.
   * Rest of the steps are visiblef after first step is saved.
   */
  const createSubmissionStep = {
    title: t("submission.datasetDetails"),
    schemas: [
      {
        objectType: ObjectTypes.submissionDetails,
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
        objectType: ObjectTypes.dacPolicies,
        name: t("dacPolicies.title"),
        objects: getRemsObject(),
        required: true,
      },
    ],
  }

  const dataBucketStep = {
    title: t("dataBucket.dataBucket"),
    schemas: [
      {
        objectType: ObjectTypes.bucket,
        name: t("dataBucket.linkBucket"),
        objects: submission?.bucket
          ? [
              {
                id: `linked-data-bucket-${submission.submissionId}`,
                displayTitle: submission?.bucket,
              },
            ]
          : [],
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
        objectType: ObjectTypes.summary,
        objects: [],
        required: true,
      },
      {
        name: t("publishSubmission"),
        objectType: ObjectTypes.publish,
        objects: [],
        required: true,
      },
    ],
  }
  // Comment out steps for other workflows
  const mappedSteps = submission.submissionId
    ? // ? currentWorkflow?.name == WorkflowTypes.sdsx
      // [createSubmissionStep, dacPoliciesStep, dataBucketStep, ...schemaSteps, idPublishStep]
      [createSubmissionStep, dacPoliciesStep, dataBucketStep, idPublishStep]
    : //  : [createSubmissionStep, ...schemaSteps, dataBucketStep, idPublishStep]
      [createSubmissionStep]
  return { mappedSteps }
}

export default mapObjectsToStepsHook
