import { createSlice } from "@reduxjs/toolkit"
import folderAPIService from "services/folderAPI"

const initialState = null

const submissionFolderSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    setFolder: (state, action) => action.payload,
    resetFolder: () => initialState,
  },
})
export const { setFolder, resetFolder } = submissionFolderSlice.actions
export default submissionFolderSlice.reducer

export const createNewDraftFolder = folderDetails => async dispatch => {
  const response = await folderAPIService.createNewFolder({ ...folderDetails, published: false, metadataObjects: [] })
  if (!response.ok) return
  const folderResponse = await folderAPIService.getFolderById(response.data.folderId)
  if (!folderResponse.ok) return
  dispatch(setFolder(folderResponse.data))
}
