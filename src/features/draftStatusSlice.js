//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: string = ""

const draftStatusSlice: any = createSlice({
  name: "draftStatus",
  initialState,
  reducers: {
    setDraftStatus: (state, action) => action.payload,
    resetDraftStatus: () => initialState,
  },
})

export const { setDraftStatus, resetDraftStatus } = draftStatusSlice.actions
export default draftStatusSlice.reducer
