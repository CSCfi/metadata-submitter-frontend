//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const objectTypeSlice = createSlice({
  name: "objectType",
  initialState,
  reducers: {
    setObjectType: (state, action) => action.payload,
    resetObjectType: () => initialState,
  },
})

export const { setObjectType, resetObjectType } = objectTypeSlice.actions
export default objectTypeSlice.reducer
