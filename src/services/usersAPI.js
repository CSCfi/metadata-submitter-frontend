//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/users" })

const getUserID = async (userID: string) => {
  return await api.get(`/${userID}`)
}

const deleteUserID = async (userID: string) => {
  return await api.delete(`/${userID}`)
}

export default {
  getUserID,
  deleteUserID,
}
