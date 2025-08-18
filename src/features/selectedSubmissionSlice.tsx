import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import type { SubmissionDetailsWithId } from "types"

const initialState = {} as SubmissionDetailsWithId

const selectedSubmissionSlice = createSlice({
  name: "selectedSubmission",
  initialState,
  reducers: {
    setSelectedSubmission: (state, action) => action.payload,
    resetSelectedSubmission: () => initialState,
    deleteFromAllObjects: (state, action) => {
      state.allObjects = _reject(state.allObjects, function (o: { accessionId: string }) {
        return o.accessionId === action.payload
      })
    },
  },
})

export const { setSelectedSubmission, resetSelectedSubmission, deleteFromAllObjects } =
  selectedSubmissionSlice.actions
export default selectedSubmissionSlice.reducer
