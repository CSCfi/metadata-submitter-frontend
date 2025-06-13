import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/users" })
api.addMonitor(errorMonitor)

const getUser = async (): Promise<APIResponse> => {
  return await api.get("")
}

export default {
  getUser,
}
