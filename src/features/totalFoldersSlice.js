//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState: {} = { totalUnpublishedFolders: 0, totalPublishedFolders: 0 }

const totalFoldersSlice: any = createSlice({
  name: "totalFolders",
  initialState,
  reducers: {
    setTotalFolders: (state, action) => action.payload,
    resetTotalFolderss: () => initialState,
  },
})

export const { setTotalFolders, resetTotalFolderss } = totalFoldersSlice.actions
export default totalFoldersSlice.reducer
