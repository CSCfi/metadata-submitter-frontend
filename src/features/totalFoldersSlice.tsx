import { createSlice } from "@reduxjs/toolkit"

const initialState = { totalUnpublishedFolders: [], totalPublishedFolders: [] }

const totalFoldersSlice = createSlice({
  name: "totalFolders",
  initialState,
  reducers: {
    setTotalFolders: (_state, action) => action.payload,
    resetTotalFolderss: () => initialState,
  },
})

export const { setTotalFolders, resetTotalFolderss } = totalFoldersSlice.actions
export default totalFoldersSlice.reducer
