//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = -1

const wizardStepSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    increment: state => state + 1,
    decrement: state => state - 1,
    resetWizard: () => initialState,
  },
})
export const { increment, decrement, resetWizard } = wizardStepSlice.actions
export default wizardStepSlice.reducer
