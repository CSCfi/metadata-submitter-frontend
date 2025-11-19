import { createSlice } from "@reduxjs/toolkit"

import type { SubmissionDetailsWithId } from "types"

const initialState = {} as SubmissionDetailsWithId

const selectedSubmissionSlice = createSlice({
  name: "selectedSubmission",
  initialState,
  reducers: {
    setSelectedSubmission: (state, action) => action.payload,
    resetSelectedSubmission: () => initialState,
  },
})

export const { setSelectedSubmission, resetSelectedSubmission } = selectedSubmissionSlice.actions
export default selectedSubmissionSlice.reducer
