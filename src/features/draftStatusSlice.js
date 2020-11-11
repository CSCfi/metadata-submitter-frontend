//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const draftStatusSlice = createSlice({
  name: "draftStatus",
  initialState,
  reducers: {
    setDraftStatus: (state, action) => action.payload,
    resetDraftStatus: () => initialState,
  },
})

export const { setDraftStatus, resetDraftStatus } = draftStatusSlice.actions
export default draftStatusSlice.reducer
