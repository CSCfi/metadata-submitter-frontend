import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const projectIdSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjectId: (_state, action) => action.payload,
    resetProjectId: () => initialState,
  },
})
export const { setProjectId, resetProjectId } = projectIdSlice.actions
export default projectIdSlice.reducer
