//@flow
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

export default {
  getUserById,
  deleteUserById,
}
