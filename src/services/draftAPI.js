//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/drafts" })

const createFromJSON = async (objectType: string, JSONContent: any) => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string) => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (objectType: string) => {
  return await api.get(`/${objectType}`)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string) => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromJSON,
  getObjectByAccessionId,
  getAllObjectsByObjectType,
  deleteObjectByAccessionId,
}
