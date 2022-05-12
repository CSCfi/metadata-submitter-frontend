import { DisplayObjectTypes, ObjectTypes } from "constants/wizardObject"
import { Schema, StepObject, SubmissionFolder } from "types"

const mapObjectsToStepsHook = (folder: SubmissionFolder, objectTypesArray: Schema[]): StepObject[] => {
  // Group objects by schema and status of the object
  // Sort newest first by reversing array order
  const groupedObjects = objectTypesArray
    .map((schema: Schema) => {
      const mapItem = item => ({ id: item.accessionId, displayTitle: item.tags.displayTitle, objectData: { ...item } })
      return {
        [schema]: {
          drafts: folder.drafts
            .filter((object: { schema: string }) => object.schema.toLowerCase() === `draft-${schema.toLowerCase()}`)
            .map(item => mapItem(item))
            .reverse(),
          ready: folder.metadataObjects
            .filter((object: { schema: string }) => object.schema.toLowerCase() === schema.toLowerCase())
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
  const allStepItemsReady = (objectTypes: string[]) => {
    const foundObjects: string[] = []

    objectTypes.forEach(type => {
      if (groupedObjects[type]?.drafts.length || groupedObjects[type]?.ready.length) {
        foundObjects.push(type)
      }
    })

    return foundObjects.length === objectTypes.length
  }

  /*
   * List of accordion steps and configurations.
   * Steps are disabled by checking if previous step has been filled.
   * First step is always enabled.
   */
  const mappedSteps = [
    {
      label: "Submission details",
      stepItems: [
        {
          objectType: "submissionDetails",
          label: "Name your submission",
          objects: {
            ready: folder.folderId ? [{ id: folder.folderId, displayTitle: folder.name }] : [],
          },
        },
      ],
      actionButtonText: "Edit",
    },
    {
      label: "Study, DAC and Policy",
      stepItems: [
        {
          objectType: ObjectTypes.study,
          label: DisplayObjectTypes[ObjectTypes.study],
          objects: groupedObjects[ObjectTypes.study],
        },
        {
          objectType: ObjectTypes.dac,
          label: DisplayObjectTypes[ObjectTypes.dac],
          objects: groupedObjects[ObjectTypes.dac],
        },
        {
          objectType: ObjectTypes.policy,
          label: DisplayObjectTypes[ObjectTypes.policy],
          objects: groupedObjects[ObjectTypes.policy],
        },
      ],
      actionButtonText: "Add",
      disabled: folder.folderId === "",
    },
    {
      label: "Datafolder",
      stepItems: [
        {
          objectType: "datafolder",
          label: "Datafolder",
        },
      ],
      actionButtonText: "Link datafolder",
      disabled: !allStepItemsReady([ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy]), // Placeholder rule until feature is ready
    },
    {
      label: "Describe",
      stepItems: [
        {
          objectType: ObjectTypes.sample,
          label: DisplayObjectTypes[ObjectTypes.sample],
          objects: groupedObjects[ObjectTypes.sample],
        },
        {
          objectType: ObjectTypes.experiment,
          label: DisplayObjectTypes[ObjectTypes.experiment],
          objects: groupedObjects[ObjectTypes.experiment],
        },
        {
          objectType: ObjectTypes.run,
          label: DisplayObjectTypes[ObjectTypes.run],
          objects: groupedObjects[ObjectTypes.run],
        },
        {
          objectType: ObjectTypes.analysis,
          label: DisplayObjectTypes[ObjectTypes.analysis],
          objects: groupedObjects[ObjectTypes.analysis],
        },
        {
          objectType: ObjectTypes.dataset,
          label: DisplayObjectTypes[ObjectTypes.dataset],
          objects: groupedObjects[ObjectTypes.dataset],
        },
      ],
      actionButtonText: "Add",
      disabled: !allStepItemsReady([ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy]),
    },
    {
      label: "Identifier and publish",
      stepItems: [
        {
          objectType: "summary",
          label: "Summary",
        },
      ],
      actionButtonText: "View summary",
      disabled: !allStepItemsReady([
        ObjectTypes.sample,
        ObjectTypes.run,
        ObjectTypes.experiment,
        ObjectTypes.dataset,
        ObjectTypes.analysis,
      ]),
    },
  ]

  return mappedSteps
}

export default mapObjectsToStepsHook
