import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/users")

const api = createApiClient(apiPath)

const getUser = (): Promise<APIResponse> => api.get("")

export default {
  getUser,
}
