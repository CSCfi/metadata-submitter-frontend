//@flow
import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"

const api = create({ baseURL: "/drafts" })
api.addMonitor(errorMonitor)

const createFromJSON = async (objectType: string, JSONContent: any): Promise<any> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const patchFromJSON = async (objectType: string, accessionId: any, JSONContent: any): Promise<any> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
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
