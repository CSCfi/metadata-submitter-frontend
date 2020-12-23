//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/users" })

const getUserID = async (userID: string) => {
  return await api.get(`/${userID}`)
}

const deleteUserID = async (userID: string) => {
  return await api.delete(`/${userID}`)
}

const logoutUser = async () => {
  const logout = create({ baseURL: "/logout" })
  return await logout.get()
}

export default {
  getUserID,
  deleteUserID,
  logoutUser,
}
