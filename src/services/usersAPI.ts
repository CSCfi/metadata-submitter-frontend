import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/users" })
api.addMonitor(errorMonitor)

const getUserById = async (userID: string): Promise<any> => {
  return await api.get(`/${userID}`)
}

const deleteUserById = async (userID: string): Promise<any> => {
  return await api.delete(`/${userID}`)
}

const patchUserById = async (userID: string, changes: any[]): Promise<any> => {
  return await api.patch(`/${userID}`, changes)
}

export default {
  getUserById,
  deleteUserById,
  patchUserById,
}
