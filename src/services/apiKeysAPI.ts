import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/api/keys")

const api = createApiClient(apiPath)

const addAPIKey = (name: string): Promise<APIResponse> => {
  return api.post("", { key_id: name })
}

const deleteAPIKey = (name: string): Promise<APIResponse> => {
  return api.delete("", { data: { key_id: name } })
}

const getAPIKeys = () => api.get("", {})

export default {
  getAPIKeys,
  addAPIKey,
  deleteAPIKey,
}
