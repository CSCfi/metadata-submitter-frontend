//@flow
import $RefParser from "@apidevtools/json-schema-ref-parser"

/*
 * Solve $ref -references in schema, return new schema instead of modifying passed in-place.
 */
export const dereferenceSchema = async (schema: any): Promise<any> => {
  let dereferenced = JSON.parse(JSON.stringify(schema))
  await $RefParser.dereference(dereferenced)
  delete dereferenced["definitions"]
  return dereferenced
}

/*
 * Translate array of path object levels (such as ["descriptor", "studyType"]) to unique name ("descriptor.studyType")
 */
export const pathToName = (path: string[]): string => path.join(".")

/*
 * Parse initial values from given object
 */
export const traverseValues = (object: any): any => {
  if (object["oneOf"]) return object

  switch (object["type"]) {
    case "object": {
      let values = {}
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        values[propertyKey] = traverseValues(property)
      }

      return ((values: any): typeof object)
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
