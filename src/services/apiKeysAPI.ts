import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/api/keys")

const api = create({ baseURL: apiPath })
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
