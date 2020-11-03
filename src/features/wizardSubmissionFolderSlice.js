//@flow
import { createSlice } from "@reduxjs/toolkit"

import objectAPIService from "../services/objectAPI"

import folderAPIService from "services/folderAPI"

const initialState = null

const wizardSubmissionFolderSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    setFolder: (state, action) => action.payload,
    addObject: (state, action) => {
      state.metadataObjects.push(action.payload)
    },
    resetFolder: () => initialState,
    publishFolder: (state, action) => action.payload,
  },
})
export const { setFolder, addObject, resetFolder, publishFolder } = wizardSubmissionFolderSlice.actions
export default wizardSubmissionFolderSlice.reducer

type FolderFromForm = {
  name: string,
  description: string,
}

type ObjectInFolder = {
  accessionId: string,
  schema: string,
}

type FolderNoId = {
  name: string,
  description: string,
  published: boolean,
  metadataObjects: Array<ObjectInFolder>,
}

type Folder = FolderNoId & { id: string }

export const createNewDraftFolder = (folderDetails: FolderFromForm) => async (dispatch: any => void) => {
  const folderForBackend: FolderNoId = {
    ...folderDetails,
    published: false,
    metadataObjects: [],
  }
  const response = await folderAPIService.createNewFolder(folderForBackend)
  if (!response.ok) return
  const folder: Folder = {
    ...folderForBackend,
    id: response.data.folderId,
  }
  dispatch(setFolder(folder))
}

export const addObjectToFolder = (folderID: string, objectDetails: ObjectInFolder) => async (dispatch: any => void) => {
  const changes = [{ op: "add", path: "/metadataObjects/-", value: objectDetails }]
  const response = await folderAPIService.patchFolderById(folderID, changes)
  if (!response.ok) {
    console.log(response)
    return
  }
  dispatch(addObject(objectDetails))
}

export const publishFolderContent = (folder: Folder) => async (dispatch: any => void) => {
  const changes = [{ op: "replace", path: "/published", value: true }]
  const response = await folderAPIService.patchFolderById(folder.id, changes)
  if (!response.ok) {
    console.log(response)
    return
  }
  dispatch(publishFolder(folder.id))
}

export const deleteFolderAndContent = (folder: Folder) => async (dispatch: any => void) => {
  if (folder) {
    const response = await folderAPIService.deleteFolderById(folder.id)
    if (!response.ok) console.error(`Couldn't delete folder with id ${folder.id}`)
    if (folder.metadataObjects) {
      await Promise.all(
        folder.metadataObjects.map(async object => {
          const response = await objectAPIService.deleteObjectByAccessionId(object.schema, object.accessionId)
          if (!response.ok) console.error(`Couldn't delete object with accessionId ${object.accessionId}`)
        })
      )
    }
  }
  dispatch(resetFolder())
}
