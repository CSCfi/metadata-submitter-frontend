import { createSlice } from "@reduxjs/toolkit"

import { MappedSteps } from "types"

const initialState: MappedSteps[] = []

const wizardMappedStepsSlice = createSlice({
  name: "wizardMappedSteps",
  initialState,
  reducers: {
    setWizardMappedSteps: (_state, action) => action.payload,
    resetWizardMappedSteps: () => initialState,
  },
})
export const { setWizardMappedSteps, resetWizardMappedSteps } = wizardMappedStepsSlice.actions
export default wizardMappedStepsSlice.reducer
