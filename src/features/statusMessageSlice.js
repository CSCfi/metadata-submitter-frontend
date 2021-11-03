//@flow
import { createSlice } from "@reduxjs/toolkit"

import type { StatusDetails, Response } from "types"

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
    const response = statusDetails.response || {}

    const statusResponse: Response = {
      config: { baseURL: response.config.baseURL, method: response.config.method },
      data: response.data,
      ok: response.ok,
      status: response.status,
    }

    const details: StatusDetails = {
      status: statusDetails.status,
      response: statusResponse,
      helperText: statusDetails.helperText,
    }

    dispatch(setStatusDetails(details))
  }
