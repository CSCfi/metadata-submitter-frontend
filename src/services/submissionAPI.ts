import createApiClient from "./apiClient"

import {
  APIResponse,
  MetaObject,
  PaginatedSubmissions,
  RegistrationDetails,
  SubmissionDetails,
  SubmissionDetailsWithId,
  SubmissionId,
} from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/submissions")

const api = createApiClient(apiPath)

const createNewSubmission = (submission: SubmissionDetails): Promise<APIResponse<SubmissionId>> => {
  return api.post("", submission)
}

const getSubmissionById = (submissionId: string): Promise<APIResponse<SubmissionDetailsWithId>> => {
  return api.get(`/${submissionId}`)
}

const patchSubmissionById = (
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse<SubmissionId>> => {
  return api.patch(`/${submissionId}`, JSONContent)
}

const deleteSubmissionById = (submissionId: string): Promise<APIResponse<void>> => {
  return api.delete(`/${submissionId}`)
}

const getSubmissions = (params: {
  page: number
  per_page: number
  published: boolean
  projectId: string
}): Promise<APIResponse<PaginatedSubmissions>> => {
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
): Promise<APIResponse<MetaObject[]>> => {
  return api.get(`/${submissionId}/objects/docs`, { params: { objectType } })
}

const getObjectByObjectId = (
  submissionId: string,
  objectType: string,
  objectId: string
): Promise<APIResponse<MetaObject>> => {
  return api.get(`/${submissionId}/objects/docs`, { params: { objectType, objectId } })
}

const getSubmissionRegistrations = (
  submissionId: string
): Promise<APIResponse<RegistrationDetails>> => {
  return api.get(`/${submissionId}/registrations`)
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
