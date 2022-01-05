import { createSlice } from "@reduxjs/toolkit"

import { Schema } from "types"

const initialState: Array<Schema> = []

const objectTypesArraySlice = createSlice({
  name: "objectsArraySlice",
  initialState,
  reducers: {
    setObjectTypesArray: (_state, action) => action.payload,
    resetObjectTypesArray: () => initialState,
  },
})

export const { setObjectTypesArray } = objectTypesArraySlice.actions
export default objectTypesArraySlice.reducer
