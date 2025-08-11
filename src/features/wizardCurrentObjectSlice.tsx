import { createSlice } from "@reduxjs/toolkit"

import { CurrentFormObject } from "types"

const initialObject = {
  accessionId: "",
}

const initialState: CurrentFormObject & {
  cleanedValues: CurrentFormObject
} = {
  ...initialObject,
  cleanedValues: initialObject,
}

const wizardCurrentObjectSlice = createSlice({
  name: "currentObject",
  initialState,
  reducers: {
    setCurrentObject: (_state, action) => action.payload,
    resetCurrentObject: () => initialState,
  },
})

export const { setCurrentObject, resetCurrentObject } = wizardCurrentObjectSlice.actions
export default wizardCurrentObjectSlice.reducer
