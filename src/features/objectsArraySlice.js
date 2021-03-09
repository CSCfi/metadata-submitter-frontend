//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: [] | Array<string> = []

const objectsArraySlice: any = createSlice({
  name: "objectsArraySlice",
  initialState,
  reducers: {
    setObjectsArray: (state, action) => action.payload,
    resetObjectsArray: () => initialState,
  },
})

export const { setObjectsArray } = objectsArraySlice.actions
export default objectsArraySlice.reducer
