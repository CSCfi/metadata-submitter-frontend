//@flow
import { createSlice } from "@reduxjs/toolkit"

const objectTypeSlice = createSlice({
  name: "objectType",
  initialState: {
    objectType: "",
  },
  reducers: {
    setObjectType(state, action) {
      state.objectType = action.payload
    },
  },
})

export const { setObjectType } = objectTypeSlice.actions

export default objectTypeSlice.reducer
