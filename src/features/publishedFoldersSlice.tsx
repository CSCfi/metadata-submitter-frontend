import { createSlice } from "@reduxjs/toolkit"

import type { FolderDetailsWithId } from "types"

const initialState: FolderDetailsWithId[] = []

const publishedFoldersSlice = createSlice({
  name: "publishedFolders",
  initialState,
  reducers: {
    setPublishedFolders: (_state, action) => action.payload,
    resetPublishedFolders: () => initialState,
  },
})

export const { setPublishedFolders, resetPublishedFolders } = publishedFoldersSlice.actions
export default publishedFoldersSlice.reducer
