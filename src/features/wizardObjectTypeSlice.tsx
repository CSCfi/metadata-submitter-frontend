import { createSlice } from "@reduxjs/toolkit"

const initialState = ""

const wizardObjectTypeSlice: any = createSlice({
  name: "objectType",
  initialState,
  reducers: {
    setObjectType: (state, action) => action.payload,
    resetObjectType: () => initialState,
  },
})

export const { setObjectType, resetObjectType } = wizardObjectTypeSlice.actions
export default wizardObjectTypeSlice.reducer
