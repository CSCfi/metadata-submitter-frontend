//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = []

const unpublishedFoldersSlice = createSlice({
  name: "unpublishedFolders",
  initialState,
  reducers: {
    setUnpublishedFolders: (state, action) => action.payload,
    resetUnpublishedFolderss: () => initialState,
  },
})

export const { setUnpublishedFolders, resetUnpublishedFolders } = unpublishedFoldersSlice.actions
export default unpublishedFoldersSlice.reducer
