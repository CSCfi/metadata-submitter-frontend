import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/files" })
api.addMonitor(errorMonitor)

const getProjectFiles = async (projectId: string): Promise<APIResponse> => {
  return await api.get("", { projectId })
}

export default {
  getProjectFiles,
}
