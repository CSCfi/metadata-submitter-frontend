//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: Object = ""

const autocompleteFieldSlice: any = createSlice({
  name: "autocompleteField",
  initialState,
  reducers: {
    setAutocompleteField: (state, action) => action.payload,
    resetAutocompleteField: () => initialState,
  },
})

export const { setAutocompleteField, resetAutocompleteField } = autocompleteFieldSlice.actions
export default autocompleteFieldSlice.reducer
