import { createSlice } from "@reduxjs/toolkit"

const initialState = false

const loadingSlice: any = createSlice({
  name: "focusSlice",
  initialState,
  reducers: {
    setLoading: () => true,
    resetLoading: () => initialState,
  },
})

export const { setLoading, resetLoading } = loadingSlice.actions
export default loadingSlice.reducer
