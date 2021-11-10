import { createSlice } from "@reduxjs/toolkit"
import { reject } from "lodash"

const initialState: any[] = []

const fileTypesSlice: any = createSlice({
  name: "fileTypes",
  initialState,
  reducers: {
    setFileTypes: (state, action) => {
      if (state.find(obj => obj.accessionId === action.payload.accessionId)) {
        state = state.filter(obj => obj.accessionId !== action.payload.accessionId)
      }
      state.push(action.payload)
    },
    deleteFileType: (state, action) => {
      return (state = reject(state, function (o) {
        return o.accessionId === action.payload
      }))
    },
    resetFileTypes: () => initialState,
  },
})

export const { setFileTypes, deleteFileType, resetFileTypes } = fileTypesSlice.actions
export default fileTypesSlice.reducer
