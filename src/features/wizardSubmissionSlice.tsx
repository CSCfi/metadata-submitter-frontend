import { createSlice } from "@reduxjs/toolkit"
import { extend, reject, merge } from "lodash"

import { ObjectStatus } from "constants/wizardObject"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import publishAPIService from "services/publishAPI"
import submissionAPIService from "services/submissionAPI"
import type {
  SubmissionDetails,
  SubmissionDetailsWithId,
  SubmissionDataFromForm,
  ObjectInsideSubmissionWithTags,
  DoiFormDetails,
  ObjectTags,
  APIResponse,
  DoiCreator,
  DoiContributor,
  DoiSubject,
  DispatchReducer,
  RemsDetails
} from "types"

type InitialState = SubmissionDetailsWithId & {
  doiInfo: Record<string, unknown> & DoiFormDetails
} & { linkedFolder?: string } & { rems?: RemsDetails}

const initialState: InitialState = {
  submissionId: "",
  name: "",
  description: "",
  workflow: "",
  published: false,
  drafts: [],
  metadataObjects: [],
  doiInfo: { creators: [], contributors: [], subjects: [] },
  linkedFolder: "",
}

const setTags = (
  objects: ObjectInsideSubmissionWithTags[],
  accessionId: string,
  tags: ObjectTags
) => {
  const item = objects.find((item: { accessionId: string }) => item.accessionId === accessionId)
  if (item) item.tags = tags
}

const wizardSubmissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {
    setSubmission: (_state, action) => action.payload,
    addObject: (state, action) => {
      state.metadataObjects.push(action.payload)
    },
    addDraftObject: (state: InitialState, action) => {
      state.drafts.push(action.payload)
    },
    addDoiInfo: (state, action) => {
      state.doiInfo = action.payload
    },
    deleteObject: (state: InitialState, action) => {
      if (state)
        state.metadataObjects = reject(
          state.metadataObjects,
          function (o: { accessionId: string }) {
            return o.accessionId === action.payload
          }
        )
    },
    deleteDraftObject: (state, action) => {
      if (state)
        state.drafts = reject(state.drafts, function (o: { accessionId: string }) {
          return o.accessionId === action.payload
        })
    },
    modifyObjectTags: (state, action) => {
      setTags(state.metadataObjects, action.payload.accessionId, action.payload.tags)
    },
    modifyDraftObjectTags: (state, action) => {
      setTags(state.drafts, action.payload.accessionId, action.payload.tags)
    },
    addLinkedFolder: (state, action) => {
      state.linkedFolder = action.payload
    },
    addRemsData: (state, action) => {
      state.rems = action.payload
    },
    resetSubmission: () => initialState,
  },
})

export const {
  setSubmission,
  addObject,
  addDraftObject,
  addDoiInfo,
  deleteObject,
  deleteDraftObject,
  modifyObjectTags,
  modifyDraftObjectTags,
  addLinkedFolder,
  addRemsData,
  resetSubmission,
} = wizardSubmissionSlice.actions
export default wizardSubmissionSlice.reducer

export const createSubmission =
  (
    projectId: string,
    submissionDetails: SubmissionDataFromForm,
    drafts?: ObjectInsideSubmissionWithTags[]
  ) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const { name, description, workflowType: workflow } = submissionDetails
    const submissionForBackend: SubmissionDetails & { projectId: string } = {
      name,
      description,
      workflow,
      projectId,
      published: false,
      metadataObjects: [],
      drafts: drafts ? drafts : [],
    }
    const response = await submissionAPIService.createNewSubmission(submissionForBackend)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        const submission: SubmissionDetailsWithId = {
          ...submissionForBackend,
          submissionId: response.data.submissionId,
        }
        dispatch(setSubmission(submission))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const updateSubmission =
  (
    submissionId: string,
    submissionDetails: SubmissionDataFromForm & { submission: SubmissionDetailsWithId }
  ) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.patchSubmissionById(submissionId, {
      name: submissionDetails.name,
      description: submissionDetails.description,
    })

    return new Promise((resolve, reject) => {
      if (response.ok) {
        const updatedSubmission = extend(
          { ...submissionDetails.submission },
          { name: submissionDetails.name, description: submissionDetails.description }
        )
        dispatch(setSubmission(updatedSubmission))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const replaceObjectInSubmission =
  (
    accessionId: string,
    tags: { submissionType?: string; displayTitle?: string; fileName?: string; fileSize?: number },
    objectStatus?: string
  ) =>
  (dispatch: (reducer: DispatchReducer) => void) => {
    objectStatus === ObjectStatus.submitted
      ? dispatch(modifyObjectTags({ accessionId: accessionId, tags: tags }))
      : dispatch(
          modifyDraftObjectTags({
            accessionId,
            tags,
          })
        )
  }

// Delete object from either metaDataObjects or drafts depending on savedType
export const deleteObjectFromSubmission =
  (savedType: string, objectId: string, objectType: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const service = savedType === ObjectStatus.submitted ? objectAPIService : draftAPIService
    const response = await service.deleteObjectByAccessionId(objectType, objectId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        savedType === ObjectStatus.submitted
          ? dispatch(deleteObject(objectId))
          : dispatch(deleteDraftObject(objectId))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const publishSubmissionContent =
  (submission: SubmissionDetailsWithId): (() => Promise<APIResponse>) =>
  async () => {
    const response = await publishAPIService.publishSubmissionById(submission.submissionId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const deleteSubmissionAndContent =
  (submissionId: string): (() => Promise<APIResponse | undefined>) =>
  async () => {
    const response = await submissionAPIService.deleteSubmissionById(submissionId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        resolve(response)
      } else {
        reject({ response: JSON.stringify(response) })
      }
    })
  }

export const addDoiInfoToSubmission =
  (submissionId: string, doiFormDetails: DoiFormDetails) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const nameType = { nameType: "Personal" }
    // Add "nameType": "Personal" to "creators" and "contributors"
    const modifiedCreators = doiFormDetails.creators?.map((creator: DoiCreator) => ({
      ...creator,
      ...nameType,
    }))

    const modifiedContributors = doiFormDetails.contributors?.map(
      (contributor: DoiContributor) => ({
        ...contributor,
        ...nameType,
      })
    )

    const subjectSchema = { subjectScheme: "Fields of Science and Technology (FOS)" }
    // Add fixed subject schema as we are using FOS by default

    const modifiedSubjects = doiFormDetails.subjects?.map((subject: DoiSubject) => ({
      ...subject,
      ...subjectSchema,
    }))

    const modifiedDoiFormDetails = merge({}, doiFormDetails, {
      creators: modifiedCreators,
      contributors: modifiedContributors,
      subjects: modifiedSubjects,
    })

    const response = await submissionAPIService.putDOIInfo(submissionId, modifiedDoiFormDetails)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addDoiInfo(doiFormDetails))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addLinkedFolderToSubmission =
  (submissionId: string, linkedFolderName: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.putLinkedFolder(submissionId, linkedFolderName)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addLinkedFolder(linkedFolderName))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addRemsToSubmission =
  (submissionId: string, remsData: Record<string, unknown>) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.putRemsData(submissionId, remsData)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addRemsData(remsData))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
