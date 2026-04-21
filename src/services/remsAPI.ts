import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { getApiPrefix } from "utils"

const apiPath = await getApiPrefix("/v1/rems")

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const getRemsInfo = async (language?: string): Promise<APIResponse> => {
  return await api.get("", language ? { language } : {})
}

export default {
  getRemsInfo,
}
