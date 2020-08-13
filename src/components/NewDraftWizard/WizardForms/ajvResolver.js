import Ajv from "ajv"
import { appendErrors } from "react-hook-form"

import JSONSchemaParser from "./JSONSchemaParser"

/*
 * Parse through ajv validation errors and transform them to errors readable by react-hook-form
 */
const parseErrorSchema = (validationError, validateAllFieldCriteria) =>
  Array.isArray(validationError.errors)
    ? validationError.errors.reduce((previous, { dataPath, message = "", params, propertyName = "" }) => {
        const path = dataPath.replace(/\//g, ".").replace(/^\./, "") || propertyName
        return {
          ...previous,
          ...(path
            ? previous[path] && validateAllFieldCriteria
              ? {
                  [path]: appendErrors(path, validateAllFieldCriteria, previous, "", message),
                }
              : {
                  [path]: previous[path] || {
                    message,
                    params,
                    ...(validateAllFieldCriteria
                      ? {
                          types: {
                            "": message || true,
                          },
                        }
                      : {}),
                  },
                }
            : {}),
        }
      }, {})
    : []

/*
 * Resolver for checking if form data is valid against schema.
 */
export const ajvResolver = validationSchema => {
  if (!validationSchema) {
    throw new Error("Undefined schema, not able to validate")
  }
  const ajv = new Ajv({ allErrors: true, coerceTypes: true })
  return async values => {
    const validate = ajv.compile(validationSchema)
    const cleanedValues = JSONSchemaParser.cleanUpFormValues(values)
    const valid = validate(cleanedValues)
    if (!valid) {
      return {
        errors: parseErrorSchema(validate, false),
        values: {},
      }
    }
    return {
      values,
      errors: {},
    }
  }
}
