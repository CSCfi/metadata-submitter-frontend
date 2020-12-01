//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = {}

const wizardDraftObjectSlice = createSlice({
  name: "draftObject",
  initialState,
  reducers: {
    setDraftObject: (state, action) => action.payload,
    resetDraftObject: () => initialState,
  },
})

export const { setDraftObject, resetDraftObject } = wizardDraftObjectSlice.actions
export default wizardDraftObjectSlice.reducer
