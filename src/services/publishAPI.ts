import createApiClient from "./apiClient"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/publish")

const api = createApiClient(apiPath)

const publishSubmissionById = (submissionId: string): Promise<APIResponse<void>> => {
  return api.patch(`/${submissionId}`)
}

export default {
  publishSubmissionById,
}
