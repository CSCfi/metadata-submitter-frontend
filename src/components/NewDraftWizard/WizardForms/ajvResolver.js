import { appendErrors } from "react-hook-form"
import Ajv from "ajv"

// This resolver is based on https://github.com/react-hook-form/resolvers/pull/14 and should be replaced with official
// ajv resolver when react-hook-forms release it!

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
                            [""]: message || true,
                          },
                        }
                      : {}),
                  },
                }
            : {}),
        }
      }, {})
    : []

export const ajvResolver = validationSchema => {
  if (!validationSchema) {
    throw new Error("Undefined schema, not able to validate")
  }
  const ajv = new Ajv({ allErrors: true, coerceTypes: true })
  return async values => {
    const validate = ajv.compile(validationSchema)
    const valid = validate(values)
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
