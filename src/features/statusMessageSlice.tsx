import { createSlice } from "@reduxjs/toolkit"

import type { DispatchReducer, StatusDetails } from "types"

const initialState: StatusDetails = { status: null, response: {}, helperText: "" }

const statusMessageSlice = createSlice({
  name: "wizardStatusMessage",
  initialState,
  reducers: {
    setStatusDetails: (_state, action) => action.payload,
    resetStatusDetails: () => initialState,
  },
})
export const { setStatusDetails, resetStatusDetails } = statusMessageSlice.actions
export default statusMessageSlice.reducer

export const updateStatus =
  (statusDetails: StatusDetails) =>
  (dispatch: (reducer: DispatchReducer) => void): void => {
    const details: StatusDetails = {
      status: statusDetails.status,
      response: JSON.stringify(statusDetails.response),
      helperText: statusDetails.helperText,
    }

    dispatch(setStatusDetails(details))
  }
