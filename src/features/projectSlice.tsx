import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjectId: (_state, action) => action.payload,
    resetProjectId: () => initialState,
  },
})
export const { setProjectId, resetProjectId } = projectSlice.actions
export default projectSlice.reducer
