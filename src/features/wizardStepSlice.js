import { createSlice } from "@reduxjs/toolkit"

const initialState = -1

const wizardStepSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    increment: state => state + 1,
    decrement: state => state - 1,
    reset: () => initialState,
  },
})
export const { increment, decrement, reset } = wizardStepSlice.actions
export default wizardStepSlice.reducer
