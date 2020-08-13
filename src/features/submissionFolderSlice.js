import { createSlice } from "@reduxjs/toolkit"

import objectAPIService from "../services/objectAPI"

import folderAPIService from "services/folderAPI"

const initialState = null

const submissionFolderSlice = createSlice({
  name: "wizardStep",
  initialState,
  reducers: {
    setFolder: (state, action) => action.payload,
    addObject: (state, action) => {
      state.metadataObjects.push(action.payload)
    },
    resetFolder: () => initialState,
  },
})
export const { setFolder, addObject, resetFolder } = submissionFolderSlice.actions
export default submissionFolderSlice.reducer

export const createNewDraftFolder = folderDetails => async dispatch => {
  let folder = {
    ...folderDetails,
    published: false,
    metadataObjects: [],
  }
  const response = await folderAPIService.createNewFolder(folder)
  if (!response.ok) return
  folder.id = response.data.folderId
  dispatch(setFolder(folder))
}

export const addObjectToFolder = (folderID, objectDetails) => async dispatch => {
  const changes = [{ op: "add", path: "/metadataObjects/-", value: objectDetails }]
  const response = await folderAPIService.patchFolderById(folderID, changes)
  if (!response.ok) {
    console.log(response)
    return
  }
  dispatch(addObject(objectDetails))
}

export const deleteFolderAndContent = folder => async dispatch => {
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
