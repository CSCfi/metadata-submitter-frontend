import { createSlice } from "@reduxjs/toolkit"

import { ObjectStatus } from "constants/wizardObject"
import type { DispatchReducer, FolderDetailsWithId } from "types"

const initialState: FolderDetailsWithId[] = []

const unpublishedFoldersSlice = createSlice({
  name: "unpublishedFolders",
  initialState,
  reducers: {
    setUnpublishedFolders: (_state, action) => action.payload,
    resetUnpublishedFolders: () => initialState,
    updateUnpublishedFolders: (state, action) => {
      if (state)
        (state as FolderDetailsWithId[]).map((folder: { folderId: string }) =>
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
  (dispatch: (reducer: DispatchReducer) => void) => {
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
