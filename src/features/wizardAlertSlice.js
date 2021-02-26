//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: boolean = false

const wizardAlertSlice: any = createSlice({
  name: "wizardAlert",
  initialState,
  reducers: {
    setAlert: () => true,
    resetAlert: () => initialState,
  },
})

export const { setAlert, resetAlert } = wizardAlertSlice.actions
export default wizardAlertSlice.reducer
