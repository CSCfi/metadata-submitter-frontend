import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const draftStatusSlice = createSlice({
  name: "draftStatus",
  initialState,
  reducers: {
    setDraftStatus: (_state, action) => action.payload,
    resetDraftStatus: () => initialState,
  },
})

export const { setDraftStatus, resetDraftStatus } = draftStatusSlice.actions
export default draftStatusSlice.reducer
