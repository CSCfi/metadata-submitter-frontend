import { createSlice } from "@reduxjs/toolkit"

import { ObjectStatus } from "constants/wizardObject"
import type { FolderDetailsWithId } from "types"

const initialState: null | [] | Array<FolderDetailsWithId> = null

const unpublishedFoldersSlice: any = createSlice({
  name: "unpublishedFolders",
  initialState,
  reducers: {
    setUnpublishedFolders: (state, action) => action.payload,
    resetUnpublishedFolderss: () => initialState,
    updateUnpublishedFolders: (state: any, action) => {
      return state.map((folder: { folderId: string }) =>
        folder.folderId === action.payload.folderId ? action.payload : folder
      )
    },
  },
})

export const { setUnpublishedFolders, resetUnpublishedFolders, updateUnpublishedFolders } =
  unpublishedFoldersSlice.actions
export default unpublishedFoldersSlice.reducer

// Remove folder from Unpublished folders when it is deleted
export const deleteFolderFromUnpublishedFolders =
  (selectedFolder: FolderDetailsWithId, objectId: string, objectStatus: string) =>
  (dispatch: (reducer: any) => void): any => {
    const updatedFolder =
      objectStatus === ObjectStatus.draft
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
