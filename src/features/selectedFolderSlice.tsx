import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import { ObjectStatus } from "constants/wizardObject"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import type { FolderDetailsWithId } from "types"

const initialState = {} as FolderDetailsWithId

const selectedFolderSlice: any = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (state, action) => action.payload,
    resetSelectedFolder: () => initialState,
    deleteFromAllObjects: (state: any, action) => {
      state.allObjects = _reject(state.allObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteDraftObject: (state: any, action) => {
      state.drafts = _reject(state.drafts, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteMetadataObject: (state: any, action) => {
      state.metadataObjects = _reject(state.metadataObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
  },
})

export const { setSelectedFolder, resetSelectedFolder, deleteFromAllObjects, deleteDraftObject, deleteMetadataObject } =
  selectedFolderSlice.actions
export default selectedFolderSlice.reducer

// Delete object from selectedFolder only available for Unpublished folder atm
export const deleteObjectFromSelectedFolder =
  (objectId: string, objectType: string, objectStatus: string) =>
  async (dispatch: (reducer: any) => void): Promise<any> => {
    const service = objectStatus === ObjectStatus.draft ? draftAPIService : objectAPIService
    const response = await service.deleteObjectByAccessionId(objectType, objectId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(deleteFromAllObjects(objectId))
        objectStatus === ObjectStatus.draft
          ? dispatch(deleteDraftObject(objectId))
          : dispatch(deleteMetadataObject(objectId))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }