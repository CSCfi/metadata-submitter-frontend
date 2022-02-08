import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const openedDoiFormSlice = createSlice({
  name: "openedDoiForm",
  initialState,
  reducers: {
    setOpenedDoiForm: (_state, action) => action.payload,
    resetOpenedDoiForm: () => initialState,
  },
})

export const { setOpenedDoiForm, resetOpenedDoiForm } = openedDoiFormSlice.actions
export default openedDoiFormSlice.reducer
