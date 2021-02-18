//@flow
import { createSlice } from "@reduxjs/toolkit"

import { ObjectStatus } from "constants/object"

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

type ObjectInFolder = {
  accessionId: string,
  schema: string,
}

type ObjectDetails = {
  accessionId: string,
  lastModified: string,
  objectType: string,
  status: string,
  title: string,
}

type SelectedFolder = {
  folderId: string,
  name: string,
  description: string,
  published: boolean,
  drafts: Array<ObjectInFolder>,
  metadataObjects: Array<ObjectInFolder>,
  allObjects?: Array<ObjectDetails>,
}

export const updateFolderToUnpublishedFolders = (
  selectedFolder: SelectedFolder,
  objectId: string,
  objectStatus: string
) => (dispatch: any => void) => {
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
