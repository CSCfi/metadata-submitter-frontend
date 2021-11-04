//@flow
import { createSlice } from "@reduxjs/toolkit"

import type { StatusDetails } from "types"

const initialState: null | StatusDetails = null

const statusMessageSlice: any = createSlice({
  name: "wizardStatusMessage",
  initialState,
  reducers: {
    setStatusDetails: (state, action) => action.payload,
    resetStatusDetails: () => initialState,
  },
})
export const { setStatusDetails, resetStatusDetails } = statusMessageSlice.actions
export default statusMessageSlice.reducer

export const updateStatus =
  (statusDetails: StatusDetails): ((dispatch: (any) => void) => Promise<void>) =>
  async (dispatch: any => void) => {
    const details: StatusDetails = {
      status: statusDetails.status,
      response: JSON.stringify(statusDetails.response),
      helperText: statusDetails.helperText,
    }

    dispatch(setStatusDetails(details))
  }
