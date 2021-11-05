//@flow
import { createSlice } from "@reduxjs/toolkit"
import { extend, reject, merge } from "lodash"

import draftAPIService from "../services/draftAPI"
import objectAPIService from "../services/objectAPI"

import { ObjectStatus } from "constants/wizardObject"
import folderAPIService from "services/folderAPI"
import publishAPIService from "services/publishAPI"
import type { FolderDetails, FolderDetailsWithId, FolderDataFromForm, ObjectInsideFolderWithTags } from "types"

const initialState: null | FolderDetailsWithId = null

const wizardSubmissionFolderSlice: any = createSlice({
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
    addDoiInfo: (state, action) => {
      state.doiInfo = action.payload
    },
    deleteObject: (state, action) => {
      state.metadataObjects = reject(state.metadataObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteDraftObject: (state, action) => {
      state.drafts = reject(state.drafts, function (o) {
        return o.accessionId === action.payload
      })
    },
    modifyObjectTags: (state, action) => {
      state.metadataObjects.find(item => item.accessionId === action.payload.accessionId).tags = action.payload.tags
    },
    modifyDraftObjectTags: (state, action) => {
      state.drafts.find(item => item.accessionId === action.payload.accessionId).tags = action.payload.tags
    },
    resetFolder: () => initialState,
  },
})

export const {
  setFolder,
  addObject,
  addDraftObject,
  addDoiInfo,
  deleteObject,
  deleteDraftObject,
  modifyObjectTags,
  modifyDraftObjectTags,
  resetFolder,
} = wizardSubmissionFolderSlice.actions
export default wizardSubmissionFolderSlice.reducer

export const createNewDraftFolder =
  (folderDetails: FolderDataFromForm, drafts?: any): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
    const folderForBackend: FolderDetails = {
      ...folderDetails,
      published: false,
      metadataObjects: [],
      drafts: drafts ? drafts : [],
    }
    const response = await folderAPIService.createNewFolder(folderForBackend)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        const folder: FolderDetailsWithId = {
          ...folderForBackend,
          folderId: response.data.folderId,
        }
        dispatch(setFolder(folder))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const updateNewDraftFolder =
  (
    folderId: string,
    folderDetails: FolderDataFromForm & { folder: Object } & { selectedDraftsArray: Array<ObjectInsideFolderWithTags> }
  ): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
    const { selectedDraftsArray } = folderDetails
    // Add templates as selectedDrafts to current drafts in case there is any
    const updatedDrafts =
      selectedDraftsArray.length > 0
        ? folderDetails.folder.drafts.concat(selectedDraftsArray)
        : folderDetails.folder.drafts

    const updatedFolder = extend(
      { ...folderDetails.folder },
      { name: folderDetails.name, description: folderDetails.description, drafts: updatedDrafts }
    )

    const changes = [
      { op: "add", path: "/name", value: folderDetails.name },
      { op: "add", path: "/description", value: folderDetails.description },
      { op: "add", path: "/drafts/-", value: updatedDrafts },
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

export const addObjectToFolder =
  (folderID: string, objectDetails: ObjectInsideFolderWithTags): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
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

export const replaceObjectInFolder =
  (
    folderID: string,
    accessionId: string,
    index: number,
    tags: { submissionType?: string, displayTitle?: string, fileName?: string },
    objectStatus?: string
  ): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
    const changes =
      objectStatus === ObjectStatus.submitted
        ? [{ op: "replace", path: `/metadataObjects/${index}/tags`, value: tags }]
        : [{ op: "replace", path: `/drafts/${index}/tags`, value: tags }]

    const response = await folderAPIService.patchFolderById(folderID, changes)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        objectStatus === ObjectStatus.submitted
          ? dispatch(modifyObjectTags({ accessionId: accessionId, tags: tags }))
          : dispatch(
              modifyDraftObjectTags({
                accessionId,
                tags,
              })
            )
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addObjectToDrafts =
  (folderID: string, objectDetails: ObjectInsideFolderWithTags): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
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
export const deleteObjectFromFolder =
  (savedType: string, objectId: string, objectType: string): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
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

export const publishFolderContent =
  (folder: FolderDetailsWithId): (() => Promise<any>) =>
  async () => {
    const response = await publishAPIService.publishFolderById(folder.folderId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const deleteFolderAndContent =
  (folder: FolderDetailsWithId): (() => Promise<any>) =>
  async () => {
    let message = ""
    if (folder) {
      if (folder.metadataObjects) {
        await Promise.all(
          folder.metadataObjects.map(async object => {
            const response = await objectAPIService.deleteObjectByAccessionId(object.schema, object.accessionId)
            if (!response.ok) message = `Couldn't delete object with accessionId ${object.accessionId}`
          })
        )
      }

      const response = await folderAPIService.deleteFolderById(folder.folderId)
      if (!response.ok) message = `Couldn't delete folder with id ${folder.folderId}`
      return new Promise((resolve, reject) => {
        if (response.ok) {
          resolve(response)
        } else {
          reject({ response: JSON.stringify(response), message: message })
        }
      })
    }
  }

export const addDoiInfoToFolder =
  (folderId: string, doiFormDetails: any): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
    const nameType = { nameType: "Personal" }
    // Add "nameType": "Personal" to "creators" and "contributors"
    const modifiedCreators = doiFormDetails.creators?.map(creator => ({
      ...creator,
      ...nameType,
    }))

    const modifiedContributors = doiFormDetails.contributors?.map(contributor => ({
      ...contributor,
      ...nameType,
    }))

    const subjectSchema = { subjectScheme: "Fields of Science and Technology (FOS)"}
    // Add fixed subject schema as we are using FOS by default

    const modifiedSubjects = doiFormDetails.subjects?.map(subject => ({
      ...subject,
      ...subjectSchema,
    }))

    const modifiedDoiFormDetails = merge({}, doiFormDetails, {
      creators: modifiedCreators,
      contributors: modifiedContributors,
      subjects: modifiedSubjects,
    })

    const changes = [{ op: "add", path: "/doiInfo", value: modifiedDoiFormDetails }]
    const response = await folderAPIService.patchFolderById(folderId, changes)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addDoiInfo(doiFormDetails))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
