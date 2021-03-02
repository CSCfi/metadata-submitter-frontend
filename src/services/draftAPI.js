//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/drafts" })
api.addMonitor(errorMonitor)

const createFromJSON = async (objectType: string, JSONContent: any): Promise<any> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const patchFromJSON = async (objectType: string, accessionId: any, JSONContent: any): Promise<any> => {
  return await api.patch(`/${objectType}/${accessionId}`, JSONContent)
}

const getAllObjectsByObjectType = async (objectType: string): Promise<any> => {
  return await api.get(`/${objectType}`)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromJSON,
  getObjectByAccessionId,
  patchFromJSON,
  getAllObjectsByObjectType,
  deleteObjectByAccessionId,
}
