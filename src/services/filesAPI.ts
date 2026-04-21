import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { getApiPrefix } from "utils"

const apiPath = await getApiPrefix("/v1/files")

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const getProjectFiles = async (projectId: string): Promise<APIResponse> => {
  return await api.get("", { projectId })
}

export default {
  getProjectFiles,
}
