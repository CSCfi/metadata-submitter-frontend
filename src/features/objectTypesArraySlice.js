//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: [] | Array<string> = []

const objectTypesArraySlice: any = createSlice({
  name: "objectsArraySlice",
  initialState,
  reducers: {
    setObjectTypesArray: (state, action) => action.payload,
    resetObjectTypesArray: () => initialState,
  },
})

export const { setObjectTypesArray } = objectTypesArraySlice.actions
export default objectTypesArraySlice.reducer
