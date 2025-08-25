import { isEqual } from "lodash"

import { setUnsavedForm, resetUnsavedForm } from "features/unsavedFormSlice"

const checkUnsavedInputHook = (
  dirtyFields: Record<string, true | Record<string, unknown>>,
  defaultValues: unknown,
  getValues: (field?: string) => unknown,
  dispatch: (action: unknown) => void
) => {
  // For every dirty field, check if default value matches current value
  const isDirty = Object.keys(dirtyFields).some(field => {
    const value = getValues(field)
    const defaultValue = defaultValues?.[field]

    if (value && !defaultValue) {
      // No default value to compare against
      return true
    }
    if (Array.isArray(value)) {
      // value is an array (e.g. nested fields)
      return value.some((item, i) => {
        if (!defaultValue?.[i]) {
          // new item added
          return true
        }
        if (!isEqual(item, defaultValue[i])) {
          // existing item modified
          return true
        }
        return false
      })
    }
    return value !== defaultValue
  })
  dispatch(isDirty ? setUnsavedForm() : resetUnsavedForm())
}

export default checkUnsavedInputHook
