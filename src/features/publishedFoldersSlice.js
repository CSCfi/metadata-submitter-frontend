//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = []

const publishedFoldersSlice: any = createSlice({
  name: "publishedFolders",
  initialState,
  reducers: {
    setPublishedFolders: (state, action) => action.payload,
    resetPublishedFolders: () => initialState,
  },
})

export const { setPublishedFolders, resetPublishedFolders } = publishedFoldersSlice.actions
export default publishedFoldersSlice.reducer
