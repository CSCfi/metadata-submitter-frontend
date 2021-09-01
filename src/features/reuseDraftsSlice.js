//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: [] = []

const reuseDrafts: any = createSlice({
  name: "userDraft",
  initialState,
  reducers: {
    setReuseDrafts: (state, action) => action.payload,
    resetReuseDrafts: () => initialState,
  },
})

export const { setReuseDrafts, resetReuseDrafts } = reuseDrafts.actions
export default reuseDrafts.reducer
