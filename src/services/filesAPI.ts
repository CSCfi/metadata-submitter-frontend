import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils"

const apiPath = await addApiPrefix("/v1/files")

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const getProjectFiles = async (projectId: string): Promise<APIResponse> => {
  return await api.get("", { projectId })
}

export default {
  getProjectFiles,
}
