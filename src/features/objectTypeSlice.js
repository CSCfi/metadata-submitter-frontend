//@flow
import { createSlice } from "@reduxjs/toolkit"

export const initialState = {
  objectType: "",
}

const objectTypeSlice = createSlice({
  name: "objectType",
  initialState,
  reducers: {
    setObjectType(state, action) {
      state.objectType = action.payload
    },
  },
})

export const { setObjectType } = objectTypeSlice.actions
export default objectTypeSlice.reducer
