//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = null

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

type StatusDetails = {
  status: string,
  response?: Object,
  helperText?: string,
}

export const updateStatus =
  (statusDetails: StatusDetails): ((dispatch: (any) => void) => Promise<void>) =>
  async (dispatch: any => void) => {
    dispatch(setStatusDetails(JSON.stringify(statusDetails)))
  }
