import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/api/keys" })
api.addMonitor(errorMonitor)

const addAPIKey = async (name: string): Promise<APIResponse> => {
  return await api.post("", JSON.stringify({ key_id: name }))
}

const deleteAPIKey = async (name: string): Promise<APIResponse> => {
  return await api.delete("", {}, { data: { key_id: name } })
}

const getAPIKeys = async (): Promise<APIResponse> => {
  return await api.get("", {})
}

export default {
  getAPIKeys,
  addAPIKey,
  deleteAPIKey,
}
