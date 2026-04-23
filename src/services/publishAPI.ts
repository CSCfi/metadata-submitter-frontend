import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils"

const apiPath = await addApiPrefix("/v1/publish")

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const publishSubmissionById = async (submissionId: string): Promise<APIResponse> => {
  return await api.patch(`/${submissionId}`)
}

export default {
  publishSubmissionById,
}
