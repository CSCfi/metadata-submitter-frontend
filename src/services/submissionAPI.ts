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
  JSONContent: { name: string; description: string }
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

const putDOIInfo = async (
  submissionId: string,
  doiFormDetails: Record<string, unknown>[]
): Promise<APIResponse> => {
  return await api.patch(`${submissionId}/doi`, doiFormDetails)
}

const putLinkedFolder = async (submissionId: string, folderName: string): Promise<APIResponse> => {
  return await api.patch(`${submissionId}/folder`, { linkedFolder: folderName })
}

const putRemsData = async (
  submissionId: string,
  remsData: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`${submissionId}/rems`, remsData)
}

export default {
  createNewSubmission,
  getSubmissionById,
  patchSubmissionById,
  deleteSubmissionById,
  getSubmissions,
  putDOIInfo,
  putLinkedFolder,
  putRemsData,
}
