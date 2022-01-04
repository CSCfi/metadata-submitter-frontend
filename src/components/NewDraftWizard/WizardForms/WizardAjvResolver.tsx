import Ajv, { ValidateFunction } from "ajv"
import addFormats from "ajv-formats"
import localize from "ajv-i18n"
import { appendErrors } from "react-hook-form"

import JSONSchemaParser from "./WizardJSONSchemaParser"

/*
 * Parse through ajv validation errors and transform them to errors readable by react-hook-form
 */
const parseErrorSchema = (validationError: ValidateFunction<unknown>, validateAllFieldCriteria: boolean) =>
  Array.isArray(validationError.errors)
    ? validationError.errors.reduce(
        (previous: Partial<Record<string, any>>, { instancePath, message = "", params, propertyName = "" }: any) => {
          const path = instancePath.replace(/\//g, ".").replace(/^\./, "") || propertyName
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
        },
        {}
      )
    : []

/*
 * Resolver for checking if form data is valid against schema.
 */
export const WizardAjvResolver = (validationSchema: any, locale: string): any => {
  if (!validationSchema) {
    throw new Error("Undefined schema, not able to validate")
  }
  const ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: false })
  addFormats(ajv, { mode: "fast", formats: ["email", "uri", "date-time"], keywords: true })
  return async (values: any) => {
    const validate = ajv.compile(validationSchema)
    const cleanedValues = JSONSchemaParser.cleanUpFormValues(values)
    const valid = validate(cleanedValues)
    if (!valid) {
      switch (locale) {
        case "fi": {
          localize.fi(validate.errors)
          break
        }
        default: {
          localize.en(validate.errors)
        }
      }
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
