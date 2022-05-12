import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const wizardXMLModalSlice = createSlice({
  name: "wizardXMLModal",
  initialState,
  reducers: {
    setXMLModalOpen: (_state, action) => action.payload,
    resetXMLModalOpen: () => initialState,
  },
})
export const { setXMLModalOpen, resetXMLModalOpen } = wizardXMLModalSlice.actions
export default wizardXMLModalSlice.reducer
