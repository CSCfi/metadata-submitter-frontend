import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/workflows" })
api.addMonitor(errorMonitor)

const getAllWorkflows = async (): Promise<APIResponse> => {
  return await api.get("")
}

const getWorkflowByType = async (workflowType: string): Promise<APIResponse> => {
  return await api.get(`/${workflowType}`)
}

export default {
  getAllWorkflows,
  getWorkflowByType,
}
