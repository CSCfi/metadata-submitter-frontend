//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const wizardErrorMessageSlice = createSlice({
  name: "wizardErrorMessage",
  initialState,
  reducers: {
    setErrorMessage: (state, action) => action.payload,
    resetErrorMessage: () => initialState,
  },
})
export const { setErrorMessage, resetErrorMessage } = wizardErrorMessageSlice.actions
export default wizardErrorMessageSlice.reducer
