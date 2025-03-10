import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/rems" })
api.addMonitor(errorMonitor)

const getRemsInfo = async (language?: string): Promise<APIResponse> => {
  return await api.get("", language ? { language } : {})
}

export default {
  getRemsInfo,
}
