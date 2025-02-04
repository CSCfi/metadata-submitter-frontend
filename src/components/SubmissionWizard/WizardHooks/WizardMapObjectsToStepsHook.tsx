import type { TFunction } from "i18next"
import { startCase } from "lodash"

import { ObjectTypes } from "constants/wizardObject"
import { WorkflowTypes } from "constants/wizardWorkflow"
import {
  Schema,
  SubmissionFolder,
  Workflow,
  WorkflowStep,
  MappedSteps,
  WorkflowSchema,
} from "types"

const mapObjectsToStepsHook = (
  submission: SubmissionFolder,
  objectTypesArray: Schema[],
  currentWorkflow: Workflow | Record<string, unknown>,
  t: TFunction,
  remsInfo: Record<string, unknown>[]
): { mappedSteps: MappedSteps[] } => {
  // Group objects by schema and status of the object
  // Sort newest first by reversing array order
  const groupedObjects = objectTypesArray
    .map((schema: Schema) => {
      const mapItem = item => ({
        id: item.accessionId,
        displayTitle: item.tags.displayTitle,
        objectData: { ...item },
      })
      return {
        [schema]: {
          drafts: submission.drafts
            .filter(
              (object: { schema: string }) =>
                object.schema.toLowerCase() === `draft-${schema.toLowerCase()}`
            )
            .map(item => mapItem(item))
            .reverse(),
          ready: submission.metadataObjects
            .filter(
              (object: { schema: string }) => object.schema.toLowerCase() === schema.toLowerCase()
            )
            .map(item => mapItem(item))
            .reverse(),
        },
      }
    })
    .reduce((map, obj) => {
      const key = Object.keys(obj)[0]
      map[key] = obj[key]
      return map
    }, {})

  // Test if object type has ready or draft objects
  const checkSchemaReady = (objectTypes: string[]) => {
    const foundObjects: string[] = []
    objectTypes.forEach(type => {
      if (groupedObjects[type]?.drafts?.length || groupedObjects[type]?.ready?.length) {
        foundObjects.push(type)
      }
    })

    return foundObjects.length === objectTypes.length
  }

  const workflowSteps: WorkflowStep[] = currentWorkflow?.steps as WorkflowStep[]

  const schemaSteps =
    workflowSteps?.length > 0
      ? workflowSteps.map((step: WorkflowStep, index: number) => {
          /*
           * Filter previous steps and check whether their required schemas
            have been saved/submitted before enabling next step
          */
          const previousSteps = workflowSteps.filter((step, ind) => ind < index)

          const requiredSchemas = previousSteps
            .flatMap(step => step.schemas)
            .reduce((result: string[], schema: WorkflowSchema) => {
              if (schema.required && schema.name !== "file") {
                result.push(schema.name)
              }
              return result
            }, [])

          return {
            ...step,
            title: step.title.toLowerCase().includes(ObjectTypes.file)
              ? t("datafolder.datafolder")
              : step.title,
            ["schemas"]: step.schemas.map(schema => ({
              ...schema,
              name: schema.name.toLowerCase().includes(ObjectTypes.file)
                ? t("datafolder.datafolder")
                : schema.name === ObjectTypes.datacite
                ? "Identifier"
                : schema.name === ObjectTypes.dac
                  ? schema.name.toUpperCase()
                  : startCase(schema.name),
              objectType: schema.name,
              objects: groupedObjects[schema.name],
            })),
            disabled: index > 0 && !checkSchemaReady(requiredSchemas),
          }
        })
      : []

  /*
  * Add to the "Identifier and publish" step of accordion the summary and publish substeps
  */
  const summarySubStep = {
    name: t("summary"),
    objectType: t("summary"),
    objects: { drafts: [], ready: [] },
    required: true,
    allowMultipleObjects: false,
  }
  const publishSubStep = {
    name: t("submission"),
    objectType: t("summaryPage.publish"),
    objects: { drafts: [], ready: [] },
    required: true,
    allowMultipleObjects: false,
  }

  // Condition prevents error when a first empty page is rendered without schemaSteps
  if (schemaSteps.length > 0) {
    schemaSteps[schemaSteps.length -1].schemas.push(summarySubStep)
    schemaSteps[schemaSteps.length -1].schemas.push(publishSubStep)
  }

  /*
   * List of accordion steps and configurations.
   * Steps are disabled by checking if previous step has been filled.
   * First step is always enabled.
   */
  const createSubmissionStep = {
    title: t("submissionDetails"),
    schemas: [
      {
        objectType: "submissionDetails",
        name: t("newSubmission.nameSubmission"),
        objects: {
          ready: submission.submissionId
            ? [{ id: submission.submissionId, displayTitle: submission.name }]
            : [],
        },
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
            const numberOfLicenses = (organization["licenses"] as Record<string, unknown>[]).length
            if (numberOfLicenses > 0) {
              arr.push({
                id: "",
                displayTitle: numberOfLicenses > 1 ? `${numberOfLicenses} policies` : "1 policy",
              })
            }
          }
          return arr
        },
        []
      )
      return remsObj
    }
  }

  const dacPoliciesStep = {
    title: t("dacPolicies.title"),
    schemas: [
      {
        objectType: "dacPolicies",
        name: t("dacPolicies.title"),
        objects: {
          ready: getRemsObject(),
        },
        required: true,
      },
    ],
  }

  const mappedSteps = (
    currentWorkflow?.name === WorkflowTypes.sdsx
      ? [createSubmissionStep, dacPoliciesStep]
      : [createSubmissionStep]
  ).concat(schemaSteps)

  const summaryStep = {
    title: t("setIdentifierPublish"),
    schemas: [
      {
        objectType: t("summary"), // REPLACE "Add" by "view" with objectype as text to the button (Add summary) inside accordion
        name: t("summary"), // Text inside accordion by isActive ChevronRightIcon
        objects: {
          ready: [],
        },
        required: true,
      },
    ],
    actionButtonText: t("summaryButtonText"), // This does place the text in the button
    disabled: submission.name === "",
  }
  if (submission.name !== "") mappedSteps.push(summaryStep)

  return { mappedSteps }
}

export default mapObjectsToStepsHook
