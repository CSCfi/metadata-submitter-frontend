import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse, SubmissionDetails } from "types"

const api = create({ baseURL: "/v1/submissions" })

api.addMonitor(errorMonitor)

const createNewSubmission = async (submission: SubmissionDetails): Promise<APIResponse> => {
  return await api.post("", submission)
}

const getSubmissionById = async (submissionId: string): Promise<APIResponse> => {
  return await api.get(`/${submissionId}`)
}

const patchSubmissionById = async (
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`/${submissionId}`, JSONContent)
}

const deleteSubmissionById = async (submissionId: string): Promise<APIResponse> => {
  return await api.delete(`/${submissionId}`)
}

const getSubmissions = async (params: {
  page: number
  per_page: number
  published: boolean
  projectId: string
}): Promise<APIResponse> => {
  return await api.get("", params)
}

/* The below 2 endpoints from backend are mostly focusing on XML objects and
 * not fully serving what we may ultimately need yet, for example json objects for FEGA or BP if we ever need.
 * Their responses are envisioned what we could get when the backend function being more generalized
 * to serve different cases in the future.
 */
const getAllObjectsByObjectType = async (
  submissionId: string,
  objectType: string
): Promise<APIResponse> => {
  return await api.get(`${submissionId}/objects/docs?objectType=${objectType}`)
}

const getObjectByObjectId = async (
  submissionId: string,
  objectType: string,
  objectId: string
): Promise<APIResponse> => {
  return await api.get(`${submissionId}/objects/docs?objectType=${objectType}&objectId=${objectId}`)
}

export default {
  createNewSubmission,
  getSubmissionById,
  patchSubmissionById,
  deleteSubmissionById,
  getSubmissions,
  getAllObjectsByObjectType,
  getObjectByObjectId,
}
