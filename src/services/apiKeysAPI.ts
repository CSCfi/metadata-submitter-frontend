import { APIResponse, APIKey } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/api/keys")

const api = createApiClient(apiPath)

const addAPIKey = (name: string): Promise<APIResponse<string>> => {
  return api.post<string, APIResponse<string>, Pick<APIKey, "key_id">>("", { key_id: name })
}

const deleteAPIKey = (name: string): Promise<APIResponse<void>> => {
  return api.delete<void, APIResponse<void>, APIKey>("", { data: { key_id: name } })
}

const getAPIKeys = (): Promise<APIResponse<APIKey[]>> => api.get("", {})

export default {
  getAPIKeys,
  addAPIKey,
  deleteAPIKey,
}
