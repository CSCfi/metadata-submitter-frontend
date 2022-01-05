import $RefParser from "@apidevtools/json-schema-ref-parser"

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
