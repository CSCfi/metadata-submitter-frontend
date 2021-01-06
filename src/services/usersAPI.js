//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/users" })

const getUserById = async (userID: string) => {
  return await api.get(`/${userID}`)
}

const deleteUserById = async (userID: string) => {
  return await api.delete(`/${userID}`)
}

export default {
  getUserById,
  deleteUserById,
}
