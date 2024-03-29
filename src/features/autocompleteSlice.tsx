import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const autocompleteFieldSlice = createSlice({
  name: "autocompleteField",
  initialState,
  reducers: {
    setAutocompleteField: (_state, action) => action.payload,
    resetAutocompleteField: () => initialState,
  },
})

export const { setAutocompleteField, resetAutocompleteField } = autocompleteFieldSlice.actions
export default autocompleteFieldSlice.reducer
