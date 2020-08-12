import { createSlice } from "@reduxjs/toolkit"
import folderAPIService from "services/folderAPI"

const initialState = null

const submissionFolderSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    setFolder: (state, action) => action.payload,
    addObjectToFolder: (state, action) => {
      state.metadataObjects.push(action.payload)
    },
    resetFolder: () => initialState,
  },
})
export const { setFolder, addObjectToFolder, resetFolder } = submissionFolderSlice.actions
export default submissionFolderSlice.reducer

export const createNewDraftFolder = folderDetails => async dispatch => {
  let folder = {
    ...folderDetails,
    published: false,
    metadataObjects: [],
  }
  const response = await folderAPIService.createNewFolder(folder)
  if (!response.ok) return
  folder.id = response.data.id
  dispatch(setFolder(folder))
}
