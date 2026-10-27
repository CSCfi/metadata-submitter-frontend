import { get } from "lodash"

import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"

const checkUnsavedInputHook = (
  dirtyFields: Record<string, true | Record<string, unknown>>,
  defaultValues: Record<string, unknown> | undefined,
  getValues: (field?: string) => unknown,
  dispatch: (action: unknown) => void,
  containsRemovableFields?: boolean
) => {
  const EXCLUDED_KEYS = ["accessionId", "cleanedValues"]

  const isDirty = (value: unknown, defaultValue: unknown) => {
    if (Array.isArray(value)) {
      // Value is an array (e.g. nested fields)
      if (Array.isArray(defaultValue) && value.length === defaultValue.length) {
        return value.some((item, i) => isDirty(item, defaultValue[i]))
      }
      return true
    } else if (value !== null && typeof value === "object") {
      if (Object.keys(value)?.length === Object.keys(defaultValue || {})?.length) {
        // Check if fields were modified
        return Object.entries(value).some(([key, val]) => {
          if (EXCLUDED_KEYS.includes(key)) return false
          return isDirty(val, defaultValue?.[key])
        })
      }
      // Fields were added / removed
      return true
    } else {
      // Compare primitive values
      if (!defaultValue) {
        // There can be cases when there is no value and no default value, but field is marked dirty
        return !!value
      }
      return value !== defaultValue
    }
  }

  const compareFields = (fields: string[]): boolean =>
    fields.some(field => {
      if (EXCLUDED_KEYS.includes(field)) return false
      const value = getValues(field)
      const defaultValue = get(defaultValues, field)
      return isDirty(value, defaultValue)
    })

  const inputValues = getValues() || {}

  // If a nested field is removed, it is not reflected in dirtyFields
  // therefore, check all fields
  const dirty = Object.keys(dirtyFields).length
    ? compareFields(Object.keys(dirtyFields))
    : containsRemovableFields
      ? compareFields(Object.keys({ ...inputValues, ...defaultValues }))
      : false

  dispatch(dirty ? setUnsavedForm() : resetUnsavedForm())
}

export default checkUnsavedInputHook
