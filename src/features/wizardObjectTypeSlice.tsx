import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const wizardObjectTypeSlice = createSlice({
  name: "objectType",
  initialState,
  reducers: {
    setObjectType: (_state, action) => action.payload,
    resetObjectType: () => initialState,
  },
})

export const { setObjectType, resetObjectType } = wizardObjectTypeSlice.actions
export default wizardObjectTypeSlice.reducer
