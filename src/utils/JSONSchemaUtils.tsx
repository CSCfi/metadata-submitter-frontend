import $RefParser from "@apidevtools/json-schema-ref-parser"
import Ajv2020 from "ajv/dist/2020"
import { mergeWith } from "lodash"

import { FormObject } from "types"

/*
 * Solve $ref -references in schema, return new schema instead of modifying passed in-place.
 */
export const dereferenceSchema = async (schema: FormObject) => {
  const dereferenced = JSON.parse(JSON.stringify(schema))
  await $RefParser.dereference(dereferenced)
  delete dereferenced["definitions"]
  return dereferenced
}

/*
 * Translate array of path object levels (such as ["descriptor", "studyType"]) to unique name ("descriptor.studyType")
 */
export const pathToName = (path: string[]): string => path.join(".")

/*
 * Get pathName for a specific field based on the pathName of another field (only different in the last element)
 */
export const getPathName = (path: Array<string>, field: string): string => {
  const pathName = path.slice(0, -1).join(".").concat(".", field)
  return pathName
}

/*
 * Parse initial values from given object
 */

type ValueType = { [key: string]: unknown }

export const traverseValues = (object: FormObject) => {
  if (object["oneOf"]) return object

  switch (object["type"]) {
    case "object": {
      const values: ValueType = {}
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey] as FormObject
        values[propertyKey] = traverseValues(property)
      }

      return values
    }
    case "string": {
      return ""
    }
    case "integer": {
      return ""
    }
    case "number": {
      return 0
    }
    case "boolean": {
      return false
    }
    case "array": {
      return []
    }
    case "null": {
      return null
    }

    default: {
      console.error(`
      No initial value parsing support for type ${object["type"]} yet.

      Pretty printed version of object with unsupported type:
      ${JSON.stringify(object, null, 2)}
      `)
      break
    }
  }
}

const rawSchemaModules = import.meta.glob("../schemas/**/*.json")
const rawDataModules = import.meta.glob("../data/**/*.json")

const getModules = (rawModules: Record<string, () => Promise<unknown>>) =>
  Object.fromEntries(Object.entries(rawModules).map(([k, v]) => [k.toLowerCase(), v]))

async function loadJSONFile<T>(
  rawModules: Record<string, () => Promise<unknown>>,
  basePath: string,
  filePath: string,
  errorMessage: string
): Promise<T> {
  const key = `${basePath}/${filePath}.json`.toLowerCase()
  const modules = getModules(rawModules)
  const loader = modules[key]
  if (!loader) {
    throw new Error(`${errorMessage}: ${basePath}/${filePath}.json`)
  }
  const module = (await loader()) as { default: T }
  return module.default
}

export async function loadJSONSchema(schemaPath: string): Promise<FormObject> {
  return loadJSONFile<FormObject>(
    rawSchemaModules,
    "../schemas",
    schemaPath,
    "JSON Schema not found"
  )
}

export async function loadJSONData<T>(dataPath: string): Promise<T> {
  return loadJSONFile<T>(rawDataModules, "../data", dataPath, "JSON Data file not found")
}

export function validateJSONSchema(schema: FormObject) {
  const ajv = new Ajv2020()
  const isValid = ajv.validateSchema(schema)
  if (!isValid) console.error(`Invalid JSON schema: ${ajv.errorsText(ajv.errors)}`)
}

export function validateJSONData<T>(schema: FormObject, data: T) {
  const ajv = new Ajv2020()
  const validate = ajv.compile(schema)
  if (!validate(data)) console.error("Invalid JSON data", data)
}

export const localizeSchema = (translationKey, namespace, baseSchema, t) => {
  const translationMap = t(`${translationKey}`, { ns: namespace, returnObjects: true }) || {}
  const customizer = (objValue, srcValue, key) => {
    // Common keys that would need translation, can be added more.
    const translatableKeys = ["title", "description", "enum"]
    if (translatableKeys.includes(key)) return srcValue
    return undefined
  }
  return mergeWith({}, baseSchema, translationMap, customizer)
}
