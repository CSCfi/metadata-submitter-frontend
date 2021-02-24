//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const focusSlice: any = createSlice({
  name: "focusSlice",
  initialState,
  reducers: {
    setFocus: () => true,
    resetFocus: () => initialState,
  },
})

export const { setFocus, resetFocus } = focusSlice.actions
export default focusSlice.reducer
