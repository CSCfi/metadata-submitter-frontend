//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: Object = ""

const autocompleteSlice: any = createSlice({
  name: "autocomplete",
  initialState,
  reducers: {
    setAutocompleteField: (state, action) => action.payload,
    resetAutocompleteField: () => initialState,
  },
})

export const { setAutocompleteField, resetAutocompleteField } = autocompleteSlice.actions
export default autocompleteSlice.reducer
