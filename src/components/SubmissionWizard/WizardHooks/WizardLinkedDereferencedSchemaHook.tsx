import { merge } from "lodash"

import { FEGAObjectTypes } from "constants/wizardObject"
import type { FormObject, StepObject } from "types"
import { getAccessionIds } from "utils"

/*
 * Link an object to another object in the form by accessionId, based on object schema
 */
const getLinkedDereferencedSchema = (
  currentObject: Record<string, unknown>,
  objectType: string,
  dereferencedSchema: Promise<FormObject>,
  objects: StepObject[],
  analysisAccessionIds: Array<string>
): Promise<FormObject> => {
  // AccessionIds of submitted objects
  const studyAccessionIds = getAccessionIds(FEGAObjectTypes.study, objects)
  const sampleAccessionIds = getAccessionIds(FEGAObjectTypes.sample, objects)
  const runAccessionIds = getAccessionIds(FEGAObjectTypes.run, objects)
  const experimentAccessionIds = getAccessionIds(FEGAObjectTypes.experiment, objects)
  const policyAccessionIds = getAccessionIds(FEGAObjectTypes.policy, objects)
  const dacAccessionIds = getAccessionIds(FEGAObjectTypes.dac, objects)

  switch (objectType) {
    case FEGAObjectTypes.experiment:
      // Study Link
      if (studyAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: { studyRef: { properties: { accessionId: { enum: studyAccessionIds } } } },
        })
      }
      // Sample Link
      if (sampleAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            design: {
              properties: {
                sampleDescriptor: {
                  oneOf: { [1]: { properties: { accessionId: { enum: sampleAccessionIds } } } },
                },
              },
            },
          },
        })
      }
      break
    case FEGAObjectTypes.analysis:
      // Study Link
      if (studyAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: { studyRef: { properties: { accessionId: { enum: studyAccessionIds } } } },
        })
      }
      // Sample Link
      if (sampleAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            sampleRef: {
              items: {
                properties: { accessionId: { enum: sampleAccessionIds } },
              },
            },
          },
        })
      }
      // Run Link
      if (runAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            runRef: {
              items: {
                properties: { accessionId: { enum: runAccessionIds } },
              },
            },
          },
        })
      }
      // Experiment Link
      if (experimentAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            experimentRef: {
              properties: { accessionId: { enum: experimentAccessionIds } },
            },
          },
        })
      }
      // Other Analysis Link
      if (analysisAccessionIds.length > 0) {
        const currentAnalysisAccessionIds = currentObject.accessionId || null
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            analysisRef: {
              items: {
                properties: {
                  accessionId: {
                    enum: analysisAccessionIds.filter(id => id !== currentAnalysisAccessionIds),
                  },
                },
              },
            },
          },
        })
      }
      break
    case FEGAObjectTypes.run:
      // Experiment Link
      if (experimentAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            experimentRef: {
              items: {
                properties: { accessionId: { enum: experimentAccessionIds } },
              },
            },
          },
        })
      }
      break
    case FEGAObjectTypes.policy:
      // DAC Link
      if (dacAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            dacRef: {
              properties: { accessionId: { enum: dacAccessionIds } },
            },
          },
        })
      }
      break
    case FEGAObjectTypes.dataset:
      // Policy Link
      if (policyAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            policyRef: {
              properties: { accessionId: { enum: policyAccessionIds } },
            },
          },
        })
      }
      // Run Link
      if (runAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            runRef: {
              items: {
                properties: { accessionId: { enum: runAccessionIds } },
              },
            },
          },
        })
      }
      // Analysis Link
      if (analysisAccessionIds.length > 0) {
        dereferencedSchema = merge({}, dereferencedSchema, {
          properties: {
            analysisRef: {
              items: {
                properties: { accessionId: { enum: analysisAccessionIds } },
              },
            },
          },
        })
      }
      break
    default:
      break
  }
  return dereferencedSchema
}

export default getLinkedDereferencedSchema
