import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const openedDoiFormSlice: any = createSlice({
  name: "openedDoiForm",
  initialState,
  reducers: {
    setOpenedDoiForm: (state, action) => action.payload,
    resetOpenedDoiForm: () => initialState,
  },
})

export const { setOpenedDoiForm, resetOpenedDoiForm } = openedDoiFormSlice.actions
export default openedDoiFormSlice.reducer
