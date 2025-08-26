import { get } from "lodash"

import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"

const checkUnsavedInputHook = (
  dirtyFields: Record<string, true | Record<string, unknown>>,
  defaultValues: unknown,
  getValues: (field?: string) => unknown,
  dispatch: (action: unknown) => void
) => {
  const isDirty = (value: unknown, defaultValue: unknown) => {
    if (Array.isArray(value)) {
      // Value is an array (e.g. nested fields)
      return value.some((item, i) => isDirty(item, defaultValue?.[i]))
    } else if (value !== null && typeof value === "object") {
      // Check all values in the object
      return Object.entries(value).some(([key, val]) => isDirty(val, defaultValue?.[key]))
    } else {
      // Compare primitive values
      if (!defaultValue) {
        // There can be cases when there is no value and no default value, but field is marked dirty
        return !!value
      }
      return value !== defaultValue
    }
  }

  // For every dirty field, check if default value matches current value
  const dirty = Object.keys(dirtyFields).some(field => {
    const value = getValues(field)
    const defaultValue = get(defaultValues, field)
    return isDirty(value, defaultValue)
  })
  dispatch(dirty ? setUnsavedForm() : resetUnsavedForm())
}

export default checkUnsavedInputHook
