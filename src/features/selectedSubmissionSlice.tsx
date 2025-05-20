import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import { ObjectStatus } from "constants/wizardObject"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import type { APIResponse, DispatchReducer, SubmissionDetailsWithId } from "types"

const initialState = {} as SubmissionDetailsWithId

const selectedSubmissionSlice = createSlice({
  name: "selectedSubmission",
  initialState,
  reducers: {
    setSelectedSubmission: (state, action) => action.payload,
    resetSelectedSubmission: () => initialState,
    deleteFromAllObjects: (state, action) => {
      state.allObjects = _reject(state.allObjects, function (o: { accessionId: string }) {
        return o.accessionId === action.payload
      })
    },
    deleteDraftObject: (state, action) => {
      state.drafts = _reject(state.drafts, function (o: { accessionId: string }) {
        return o.accessionId === action.payload
      })
    },
    deleteMetadataObject: (state, action) => {
      state.metadataObjects = _reject(state.metadataObjects, function (o: { accessionId: string }) {
        return o.accessionId === action.payload
      })
    },
  },
})

export const {
  setSelectedSubmission,
  resetSelectedSubmission,
  deleteFromAllObjects,
  deleteDraftObject,
  deleteMetadataObject,
} = selectedSubmissionSlice.actions
export default selectedSubmissionSlice.reducer

// Delete object from selectedSubmission only available for Unpublished submission atm
export const deleteObjectFromSelectedSubmission =
  (objectId: string, objectType: string, objectStatus: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
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
