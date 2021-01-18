//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = {}

const selectedFolderSlice = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (state, action) => action.payload,
    resetSelectedFolder: () => initialState,
  },
})

export const { setSelectedFolder, resetSelectedFolder } = selectedFolderSlice.actions
export default selectedFolderSlice.reducer
