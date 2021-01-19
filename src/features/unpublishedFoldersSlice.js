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

type ObjectInFolder = {
  accessionId: string,
  schema: string,
}

type DetailObject = {
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
  allObjects?: Array<DetailObject>,
}

export const updateFolderToUnpublishedFolders = (
  selectedFolder: SelectedFolder,
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
