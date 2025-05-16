import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/v1/users" })
api.addMonitor(errorMonitor)

const getUserById = async (userID: string): Promise<APIResponse> => {
  return await api.get(`/${userID}`)
}

const deleteUserById = async (userID: string): Promise<APIResponse> => {
  return await api.delete(`/${userID}`)
}

export default {
  getUserById,
  deleteUserById,
}
