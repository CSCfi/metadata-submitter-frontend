import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const wizardSubmissionTypeSlice = createSlice({
  name: "submissionType",
  initialState,
  reducers: {
    setSubmissionType: (state, action) => action.payload,
    resetSubmissionType: () => initialState,
  },
})

export const { setSubmissionType, resetSubmissionType } = wizardSubmissionTypeSlice.actions
export default wizardSubmissionTypeSlice.reducer
