import createApiClient from "./apiClient"

import { APIResponse, SubmissionDetails } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/submissions")

const api = createApiClient(apiPath)

const createNewSubmission = (submission: SubmissionDetails): Promise<APIResponse> => {
  return api.post("", submission)
}

const getSubmissionById = (submissionId: string): Promise<APIResponse> => {
  return api.get(`/${submissionId}`)
}

const patchSubmissionById = (
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return api.patch(`/${submissionId}`, JSONContent)
}

const deleteSubmissionById = (submissionId: string): Promise<APIResponse> => {
  return api.delete(`/${submissionId}`)
}

const getSubmissions = (params: {
  page: number
  per_page: number
  published: boolean
  projectId: string
}): Promise<APIResponse> => {
  return api.get("", { params })
}

/* The below 2 endpoints from backend are mostly focusing on XML objects and
 * not fully serving what we may ultimately need yet, for example json objects for FEGA or BP if we ever need.
 * Their responses are envisioned what we could get when the backend function being more generalized
 * to serve different cases in the future.
 */
const getAllObjectsByObjectType = (
  submissionId: string,
  objectType: string
): Promise<APIResponse> => {
  return api.get(`${submissionId}/objects/docs?objectType=${objectType}`)
}

const getObjectByObjectId = (
  submissionId: string,
  objectType: string,
  objectId: string
): Promise<APIResponse> => {
  return api.get(`${submissionId}/objects/docs?objectType=${objectType}&objectId=${objectId}`)
}

const getSubmissionRegistrations = (submissionId: string): Promise<APIResponse> => {
  return api.get(`${submissionId}/registrations`)
}

export default {
  createNewSubmission,
  getSubmissionById,
  patchSubmissionById,
  deleteSubmissionById,
  getSubmissions,
  getAllObjectsByObjectType,
  getObjectByObjectId,
  getSubmissionRegistrations,
}
