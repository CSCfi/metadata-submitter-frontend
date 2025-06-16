import { ErrorObject, ValidateFunction } from "ajv"
import Ajv2020 from "ajv/dist/2020"
import addFormats from "ajv-formats"
import localize from "ajv-i18n"
import { appendErrors, FieldError } from "react-hook-form"

import JSONSchemaParser from "./WizardJSONSchemaParser"

/*
 * Parse through ajv validation errors and transform them to errors readable by react-hook-form
 */
const parseErrorSchema = (
  validationError: ValidateFunction<unknown>,
  validateAllFieldCriteria: boolean
) =>
  Array.isArray(validationError.errors)
    ? validationError.errors.reduce(
        (
          previous: Partial<Record<string, unknown | FieldError | undefined>>,
          {
            instancePath,
            message = "",
            params,
            propertyName = "",
          }: ErrorObject<string, Record<string, unknown>, unknown>
        ) => {
          const path =
            instancePath.replace(/\//g, ".").replace(/^\./, "") ||
            propertyName ||
            params?.missingProperty?.toString()
          return {
            ...previous,
            ...(path
              ? previous[path] && validateAllFieldCriteria
                ? {
                    [path]: appendErrors(
                      path,
                      validateAllFieldCriteria,
                      previous as Partial<Record<string, FieldError>>,
                      "",
                      message
                    ),
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
export const WizardAjvResolver = (validationSchema: Record<string, unknown>, locale: string) => {
  if (!validationSchema) {
    throw new Error("Undefined schema, not able to validate")
  }
  const ajv = new Ajv2020({ allErrors: true, coerceTypes: true, strict: false })
  addFormats(ajv, { mode: "fast", formats: ["email", "uri", "date-time"], keywords: true })
  // Datacite date format check doesn't exist out of the box
  ajv.addFormat("rkms-iso8601-date", {
    type: "string",
    validate: dateStr => {
      const validate = (date: string) => {
        // We only accept YYYY-MM-DD
        const regex = /^\d{4}-\d{2}-\d{2}$/
        return !!(regex.test(date) && new Date(date))
      }
      const [start, end] = dateStr.split("/")
      return validate(start) && (!end || (validate(end) && new Date(end) > new Date(start)))
    },
  })
  return async (values: Record<string, unknown>) => {
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
        values: {},
        errors: parseErrorSchema(validate, false),
      }
    }
    return {
      values,
      errors: {},
    }
  }
}
