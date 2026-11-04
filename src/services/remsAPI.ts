import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/rems")

const api = createApiClient(apiPath)

const getRemsInfo = (language?: string): Promise<APIResponse> => {
  return api.get("", { params: language ? { language } : {} })
}

export default {
  getRemsInfo,
}
