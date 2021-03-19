//@flow
import { createSlice } from "@reduxjs/toolkit"

import type { FolderDetailsWithId } from "types"

const initialState: [] | Array<FolderDetailsWithId> = []

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
