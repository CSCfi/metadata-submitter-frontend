import { createSlice } from "@reduxjs/toolkit"

import { DispatchReducer } from "types"

const initialState: { step: number; stepObjectType: string } = {
  step: 1,
  stepObjectType: "submissionDetails",
}

const wizardStepObjectSlice = createSlice({
  name: "stepObject",
  initialState,
  reducers: {
    setStepObject: (_state, action) => action.payload,
    resetStepObject: () => initialState,
  },
})

export const { setStepObject, resetStepObject } = wizardStepObjectSlice.actions
export default wizardStepObjectSlice.reducer

export const updateStep =
  (stepDetails: { step: number; objectType: string }) =>
  (dispatch: (reducer: DispatchReducer) => void): void => {
    const details = {
      step: stepDetails.step,
      stepObjectType: stepDetails.objectType,
    }

    dispatch(setStepObject(details))
  }
