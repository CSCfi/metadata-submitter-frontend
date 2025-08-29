import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const unsavedFormSlice = createSlice({
  name: "unsavedForm",
  initialState,
  reducers: {
    setUnsavedForm: () => true,
    resetUnsavedForm: () => initialState,
  },
})

export const { setUnsavedForm, resetUnsavedForm } = unsavedFormSlice.actions
export default unsavedFormSlice.reducer
