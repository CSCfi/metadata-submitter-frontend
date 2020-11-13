//@flow
import { createSlice } from "@reduxjs/toolkit"
import _extend from "lodash/extend"
import _reject from "lodash/reject"

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
    deleteObject: (state, action) => {
      state.metadataObjects = _reject(state.metadataObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
    resetFolder: () => initialState,
  },
})
export const { setFolder, addObject, deleteObject, resetFolder } = wizardSubmissionFolderSlice.actions
export default wizardSubmissionFolderSlice.reducer

type FolderFromForm = {
  name: string,
  description: string,
  folder?: Object,
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
  return new Promise((resolve, reject) => {
    if (response.ok) {
      const folder: Folder = {
        ...folderForBackend,
        id: response.data.folderId,
      }
      dispatch(setFolder(folder))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const updateNewDraftFolder = (folderDetails: FolderFromForm) => async (dispatch: any => void) => {
  const updatedFolder = _extend(
    { ...folderDetails.folder },
    { name: folderDetails.name, description: folderDetails.description }
  )
  console.log(updatedFolder)
  dispatch(setFolder(updatedFolder))
}

export const addObjectToFolder = (folderID: string, objectDetails: ObjectInFolder) => async (dispatch: any => void) => {
  const changes = [{ op: "add", path: "/metadataObjects/-", value: objectDetails }]
  const response = await folderAPIService.patchFolderById(folderID, changes)
  return new Promise((resolve, reject) => {
    if (response.ok) {
      dispatch(addObject(objectDetails))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const deleteObjectFromFolder = (objectId: string, objectType: string) => async (dispatch: any => void) => {
  const response = await objectAPIService.deleteObjectByAccessionId(objectType, objectId)
  return new Promise((resolve, reject) => {
    if (response.ok) {
      dispatch(deleteObject(objectId))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const publishFolderContent = (folder: Folder) => async () => {
  const changes = [{ op: "replace", path: "/published", value: true }]
  const response = await folderAPIService.patchFolderById(folder.id, changes)

  return new Promise((resolve, reject) => {
    if (response.ok) {
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const deleteFolderAndContent = (folder: Folder) => async () => {
  let message = ""
  if (folder) {
    const response = await folderAPIService.deleteFolderById(folder.id)
    if (!response.ok) message = `Couldn't delete folder with id ${folder.id}`
    if (folder.metadataObjects) {
      await Promise.all(
        folder.metadataObjects.map(async object => {
          const response = await objectAPIService.deleteObjectByAccessionId(object.schema, object.accessionId)
          if (!response.ok) message = `Couldn't delete object with accessionId ${object.accessionId}`
        })
      )
    }
    return new Promise((resolve, reject) => {
      if (response.ok) {
        resolve(response)
      } else {
        reject({ response: JSON.stringify(response), message: message })
      }
    })
  }
}
