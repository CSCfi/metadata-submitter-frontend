//@flow
import { createSlice } from "@reduxjs/toolkit"

const initialState = []

const unpublishedFoldersSlice = createSlice({
  name: "unpublishedFolders",
  initialState,
  reducers: {
    setUnpublishedFolders: (state, action) => action.payload,
    resetUnpublishedFolderss: () => initialState,
    updateUnpublishedFolders: (state, action) => {
      return state.map(folder => (folder.folderId === action.payload.folderId ? action.payload : folder))
    },
  },
})

export const {
  setUnpublishedFolders,
  resetUnpublishedFolders,
  updateUnpublishedFolders,
} = unpublishedFoldersSlice.actions
export default unpublishedFoldersSlice.reducer

export const updateFolderToUnpublishedFolders = (
  selectedFolder: any,
  objectId: string,
  objectType: string,
  objectStatus: string
) => (dispatch: any => void) => {
  const updatedFolder =
    objectStatus === "Draft"
      ? {
          ...selectedFolder,
          drafts: selectedFolder.drafts.filter(draft => draft.accessionId !== objectId),
        }
      : {
          ...selectedFolder,
          metadataObjects: selectedFolder.metadataObjects.filter(obj => obj.accessionId !== objectId),
        }
  delete updatedFolder.allObjects
  dispatch(updateUnpublishedFolders(updatedFolder))
}
