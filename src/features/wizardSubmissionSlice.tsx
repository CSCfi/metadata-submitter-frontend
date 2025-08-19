import { createSlice } from "@reduxjs/toolkit"
import { extend, merge } from "lodash"

import publishAPIService from "services/publishAPI"
import submissionAPIService from "services/submissionAPI"
import type {
  SubmissionDetails,
  SubmissionDetailsWithId,
  SubmissionDataFromForm,
  DoiFormDetails,
  APIResponse,
  DoiCreator,
  DoiContributor,
  DoiSubject,
  DispatchReducer,
  RemsDetails,
} from "types"

type InitialState = SubmissionDetailsWithId & {
  doiInfo: Record<string, unknown> & DoiFormDetails
} & { linkedFolder?: string } & { rems?: RemsDetails }

const initialState: InitialState = {
  submissionId: "",
  name: "",
  title: "",
  description: "",
  workflow: "",
  published: false,
  doiInfo: { creators: [], contributors: [], subjects: [], keywords: "" },
  linkedFolder: "",
}

const wizardSubmissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {
    setSubmission: (_state, action) => action.payload,
    addDoiInfo: (state, action) => {
      state.doiInfo = action.payload
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

export const { setSubmission, addDoiInfo, addLinkedFolder, addRemsData, resetSubmission } =
  wizardSubmissionSlice.actions
export default wizardSubmissionSlice.reducer

export const createSubmission =
  (projectId: string, submissionDetails: SubmissionDataFromForm) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const { name, title, description, workflowType: workflow } = submissionDetails
    const submissionForBackend: SubmissionDetails & { projectId: string } = {
      name,
      title,
      description,
      workflow,
      projectId,
      published: false,
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
      title: submissionDetails.title,
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

    const modifiedSubjects = doiFormDetails.subjects?.map((subject: DoiSubject) => {
      return subject
    })

    const modifiedDoiFormDetails = merge({}, doiFormDetails, {
      creators: modifiedCreators,
      contributors: modifiedContributors,
      subjects: modifiedSubjects,
    })

    const response = await submissionAPIService.patchDOIInfo(submissionId, modifiedDoiFormDetails)

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
