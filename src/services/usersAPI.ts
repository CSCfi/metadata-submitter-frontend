import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { getApiPrefix } from "utils"

const apiPath = await getApiPrefix("/v1/users")

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const getUser = async (): Promise<APIResponse> => {
  return await api.get("")
}

export default {
  getUser,
}
