//@flow
import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import { ObjectStatus } from "constants/object"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"

const initialState = {}

const selectedFolderSlice: any = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (state, action) => action.payload,
    resetSelectedFolder: () => initialState,
    deleteFromAllObjects: (state, action) => {
      state.allObjects = _reject(state.allObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteDraftObject: (state, action) => {
      state.drafts = _reject(state.drafts, function (o) {
        return o.accessionId === action.payload
      })
    },
    deleteMetadataObject: (state, action) => {
      state.metadataObjects = _reject(state.metadataObjects, function (o) {
        return o.accessionId === action.payload
      })
    },
  },
})

export const {
  setSelectedFolder,
  resetSelectedFolder,
  deleteFromAllObjects,
  deleteDraftObject,
  deleteMetadataObject,
} = selectedFolderSlice.actions
export default selectedFolderSlice.reducer

// Delete object from selectedFolder only available for Unpublished folder atm
export const deleteObjectFromSelectedFolder = (
  objectId: string,
  objectType: string,
  objectStatus: string
): ((dispatch: (any) => void) => Promise<any>) => async (dispatch: any => void) => {
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
