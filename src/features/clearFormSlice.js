//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: boolean = false

const clearFormSlice: any = createSlice({
  name: "clearForm",
  initialState,
  reducers: {
    setClearForm: (state, action) => action.payload,
    resetClearForm: () => initialState,
  },
})

export const { setClearForm, resetClearForm } = clearFormSlice.actions
export default clearFormSlice.reducer
