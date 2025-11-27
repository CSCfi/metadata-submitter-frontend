import { createSlice } from "@reduxjs/toolkit"
import { extend, merge, omit } from "lodash"

import publishAPIService from "services/publishAPI"
import submissionAPIService from "services/submissionAPI"
import type {
  SubmissionDetails,
  SubmissionDetailsWithId,
  SubmissionDataFromForm,
  MetadataFormDetails,
  APIResponse,
  Creator,
  Contributor,
  Description,
  RelatedIdentifier,
  DispatchReducer,
  RemsDetails,
} from "types"
import { removeWhitespace } from "utils"

const initialState: SubmissionDetailsWithId = {
  projectId: "",
  submissionId: "",
  name: "",
  title: "",
  description: "",
  workflow: "",
  published: false,
  metadata: { creators: [], keywords: "" },
  bucket: "",
}

const wizardSubmissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {
    setSubmission: (_state, action) => action.payload,
    addMetadata: (state, action) => {
      state.metadata = action.payload
    },
    addBucket: (state, action) => {
      state.bucket = action.payload
    },
    addRemsData: (state, action) => {
      state.rems = action.payload
    },
    addRegistrations: (state, action) => {
      state.registrations = action.payload
    },
    resetSubmission: () => initialState,
  },
})

export const {
  setSubmission,
  addMetadata,
  addBucket,
  addRemsData,
  addRegistrations,
  resetSubmission,
} = wizardSubmissionSlice.actions
export default wizardSubmissionSlice.reducer

export const createSubmission =
  (projectId: string, submissionDetails: SubmissionDataFromForm) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const { name, title, description, workflowType: workflow } = submissionDetails
    const submissionForBackend: SubmissionDetails = {
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
  (submissionDetails: SubmissionDataFromForm & { submission: SubmissionDetailsWithId }) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.patchSubmissionById(
      submissionDetails.submission.submissionId,
      {
        name: submissionDetails.name,
        title: submissionDetails.title,
        description: submissionDetails.description,
      }
    )

    return new Promise((resolve, reject) => {
      if (response.ok) {
        const updatedSubmission = extend(
          { ...submissionDetails.submission },
          {
            name: submissionDetails.name,
            title: submissionDetails.title,
            description: submissionDetails.description,
          }
        )
        dispatch(setSubmission(updatedSubmission))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const publishSubmissionContent =
  (submission: SubmissionDetailsWithId) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await publishAPIService.publishSubmissionById(submission.submissionId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        const updatedSubmission = { ...submission, published: true }
        dispatch(setSubmission(updatedSubmission))
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

export const addMetadataToSubmission =
  (submissionId: string, metadataFormDetails: MetadataFormDetails) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const nameType = { nameType: "Personal" }
    /*
     * 'nameType' is currently set default to 'Personal for 'creators' and 'contributors'.
     * Some fields need to have whitespace removed before sending them to backend:
     * 'contributorType', 'relationType', 'resourceTypeGeneral'
     */
    const modifiedCreators = metadataFormDetails.creators?.map((creator: Creator) => ({
      ...creator,
      ...nameType,
    }))

    const modifiedContributors = metadataFormDetails.contributors?.map(
      (contributor: Contributor) => ({
        ...contributor,
        contributorType: removeWhitespace(contributor.contributorType),
        ...nameType,
      })
    )

    const modifiedDescriptions = metadataFormDetails.descriptions?.map((desc: Description) => ({
      ...desc,
      ...(desc.descriptionType ? { descriptionType: removeWhitespace(desc.descriptionType) } : {}),
    }))

    const modifiedRelatedIdentifiers = metadataFormDetails.relatedIdentifiers?.map(
      (identifier: RelatedIdentifier) => ({
        ...identifier,
        relationType: removeWhitespace(identifier.relationType),
        ...(identifier.resourceTypeGeneral
          ? { resourceTypeGeneral: removeWhitespace(identifier.resourceTypeGeneral) }
          : {}),
      })
    )

    const modifiedMetadataFormDetails = merge({}, metadataFormDetails, {
      creators: modifiedCreators,
      contributors: modifiedContributors,
      descriptions: modifiedDescriptions,
      relatedIdentifiers: modifiedRelatedIdentifiers,
    })

    delete modifiedMetadataFormDetails["accessionId"]
    delete modifiedMetadataFormDetails["cleanedValues"]

    const response = await submissionAPIService.patchSubmissionById(submissionId, {
      metadata: modifiedMetadataFormDetails,
    })

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addMetadata(metadataFormDetails))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addBucketToSubmission =
  (submissionId: string, bucketName: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.patchSubmissionById(submissionId, {
      bucket: bucketName,
    })

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addBucket(bucketName))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addRemsToSubmission =
  (submissionId: string, remsData: RemsDetails) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.patchSubmissionById(submissionId, {
      rems: remsData,
    })

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(addRemsData(remsData))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addRegistrationsToSubmission =
  (submissionId: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await submissionAPIService.getSubmissionRegistrations(submissionId)
    return new Promise((resolve, reject) => {
      if (response.ok) {
        const data = response.data?.[0]
        if (data) {
          const rest = omit(data, ["submissionId", "title", "description"])
          dispatch(addRegistrations(rest))
        }
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
