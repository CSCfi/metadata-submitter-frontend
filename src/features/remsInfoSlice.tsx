import { createSlice } from "@reduxjs/toolkit"

import type { RemsInfo } from "types"

const initialState: RemsInfo[] = [{ id: "", name: "", workflows: [], licenses: [] }]

const remsSlice = createSlice({
  name: "rems",
  initialState,
  reducers: {
    setRemsInfo: (_state, action) => action.payload,
    resetRemsInfo: () => initialState,
  },
})
export const { setRemsInfo, resetRemsInfo } = remsSlice.actions
export default remsSlice.reducer
