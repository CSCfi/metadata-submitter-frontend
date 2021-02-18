//@flow
import { createSlice } from "@reduxjs/toolkit"
import _extend from "lodash/extend"
import _reject from "lodash/reject"

import draftAPIService from "../services/draftAPI"
import objectAPIService from "../services/objectAPI"

import { ObjectStatus } from "constants/object"
import folderAPIService from "services/folderAPI"
import publishAPIService from "services/publishAPI"

const initialState = null

const wizardSubmissionFolderSlice = createSlice({
  name: "folder",
  initialState,
  reducers: {
    setFolder: (state, action) => action.payload,
    addObject: (state, action) => {
      state.metadataObjects.push(action.payload)
    },
    addDraftObject: (state, action) => {
      state.drafts.push(action.payload)
    },
    deleteObject: (state, action) => {
      state.metadataObjects = _reject(state.metadataObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteDraftObject: (state, action) => {
      state.drafts = _reject(state.drafts, function (o) {
        return o.accessionId === action.payload
      })
    },
    modifyObjectTags: (state, action) => {
      state.metadataObjects.find(item => item.accessionId === action.payload.accessionId).tags = action.payload.tags
    },
    resetFolder: () => initialState,
  },
})
export const {
  setFolder,
  addObject,
  addDraftObject,
  deleteObject,
  deleteDraftObject,
  modifyObjectTags,
  resetFolder,
} = wizardSubmissionFolderSlice.actions
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
  drafts: Array<ObjectInFolder>,
}

type Folder = FolderNoId & { id: string }

export const createNewDraftFolder = (folderDetails: FolderFromForm) => async (dispatch: any => void) => {
  const folderForBackend: FolderNoId = {
    ...folderDetails,
    published: false,
    metadataObjects: [],
    drafts: [],
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

export const updateNewDraftFolder = (folderId: string, folderDetails: FolderFromForm) => async (
  dispatch: any => void
) => {
  const updatedFolder = _extend(
    { ...folderDetails.folder },
    { name: folderDetails.name, description: folderDetails.description }
  )
  const changes = [
    { op: "add", path: "/name", value: folderDetails.name },
    { op: "add", path: "/description", value: folderDetails.description },
  ]
  const response = await folderAPIService.patchFolderById(folderId, changes)

  return new Promise((resolve, reject) => {
    if (response.ok) {
      dispatch(setFolder(updatedFolder))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
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

export const replaceObjectInFolder = (
  folderID: string,
  accessionId: string,
  index: number,
  tags: { submissionType: string, fileName: string }
) => async (dispatch: any => void) => {
  const changes = [{ op: "replace", path: `/metadataObjects/${index}/tags`, value: tags }]
  const response = await folderAPIService.patchFolderById(folderID, changes)
  return new Promise((resolve, reject) => {
    if (response.ok) {
      dispatch(modifyObjectTags({ accessionId: accessionId, tags: tags }))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const addObjectToDrafts = (folderID: string, objectDetails: ObjectInFolder) => async (dispatch: any => void) => {
  const changes = [{ op: "add", path: "/drafts/-", value: objectDetails }]
  const folderResponse = await folderAPIService.patchFolderById(folderID, changes)

  return new Promise((resolve, reject) => {
    if (folderResponse.ok) {
      dispatch(addDraftObject(objectDetails))
      resolve(folderResponse)
    } else {
      reject(JSON.stringify(folderResponse))
    }
  })
}

// Delete object from either metaDataObjects or drafts depending on savedType
export const deleteObjectFromFolder = (savedType: string, objectId: string, objectType: string) => async (
  dispatch: any => void
) => {
  const service = savedType === ObjectStatus.submitted ? objectAPIService : draftAPIService
  const response = await service.deleteObjectByAccessionId(objectType, objectId)
  return new Promise((resolve, reject) => {
    if (response.ok) {
      savedType === ObjectStatus.submitted ? dispatch(deleteObject(objectId)) : dispatch(deleteDraftObject(objectId))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}

export const publishFolderContent = (folder: Folder) => async () => {
  const response = await publishAPIService.publishFolderById(folder.id)
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
