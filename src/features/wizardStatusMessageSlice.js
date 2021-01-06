//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = null

const wizardStatusMessageSlice = createSlice({
  name: "wizardStatusMessage",
  initialState,
  reducers: {
    setStatusDetails: (state, action) => action.payload,
    resetStatusDetails: () => initialState,
  },
})
export const { setStatusDetails, resetStatusDetails } = wizardStatusMessageSlice.actions
export default wizardStatusMessageSlice.reducer

type StatusDetails = {
  successStatus: string,
  response: Object,
  errorPrefix: string,
}

export const updateStatus = (statusDetails: StatusDetails) => async (dispatch: any => void) => {
  dispatch(setStatusDetails(JSON.stringify(statusDetails)))
}
