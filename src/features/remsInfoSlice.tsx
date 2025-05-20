import { createSlice } from "@reduxjs/toolkit"

const initialState = [{ id: "", name: "", workflows: [], licenses: [] }]

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
