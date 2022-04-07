import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse, ObjectInsideFolderWithTags, ObjectTags } from "types"

const api = create({ baseURL: "/users" })
api.addMonitor(errorMonitor)

const getUserById = async (userID: string): Promise<APIResponse> => {
  return await api.get(`/${userID}`)
}

const deleteUserById = async (userID: string): Promise<APIResponse> => {
  return await api.delete(`/${userID}`)
}

const patchUserById = async (
  userID: string,
  changes: { op: string; path: string; value: Array<ObjectInsideFolderWithTags> | ObjectTags }[]
): Promise<APIResponse> => {
  return await api.patch(`/${userID}`, changes)
}

export default {
  getUserById,
  deleteUserById,
  patchUserById,
}
