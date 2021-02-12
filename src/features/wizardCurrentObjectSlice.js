//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = {}

const wizardCurrentObjectSlice = createSlice({
  name: "currentObject",
  initialState,
  reducers: {
    setCurrentObject: (state, action) => action.payload,
    resetCurrentObject: () => initialState,
  },
})

export const { setCurrentObject, resetCurrentObject } = wizardCurrentObjectSlice.actions
export default wizardCurrentObjectSlice.reducer
