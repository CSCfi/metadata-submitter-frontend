import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const clearFormSlice = createSlice({
  name: "clearForm",
  initialState,
  reducers: {
    setClearForm: (_state, action) => action.payload,
    resetClearForm: () => initialState,
  },
})

export const { setClearForm, resetClearForm } = clearFormSlice.actions
export default clearFormSlice.reducer
