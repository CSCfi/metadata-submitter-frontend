import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/publish" })
api.addMonitor(errorMonitor)

const publishSubmissionById = async (submissionId: string): Promise<APIResponse> => {
  return await api.patch(`/${submissionId}`)
}

export default {
  publishSubmissionById,
}
