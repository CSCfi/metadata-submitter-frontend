import { APIResponse, RemsInfo } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/rems")

const api = createApiClient(apiPath)

const getRemsInfo = (language?: string): Promise<APIResponse<RemsInfo[]>> => {
  return api.get("", { params: language ? { language } : {} })
}

export default {
  getRemsInfo,
}
