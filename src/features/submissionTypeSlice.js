//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const submissionTypeSlice = createSlice({
  name: "submissionType",
  initialState,
  reducers: {
    setSubmissionType: (state, action) => action.payload,
    resetSubmissionType: () => initialState,
  },
})

export const { setSubmissionType, resetSubmissionType } = submissionTypeSlice.actions
export default submissionTypeSlice.reducer
