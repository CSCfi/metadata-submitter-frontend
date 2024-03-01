import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const workflowTypeSlice = createSlice({
  name: "workflowTypeSlice",
  initialState,
  reducers: {
    setWorkflowType: (_state, action) => action.payload,
    resetWorkflowType: () => initialState,
  },
})

export const { setWorkflowType, resetWorkflowType } = workflowTypeSlice.actions
export default workflowTypeSlice.reducer
