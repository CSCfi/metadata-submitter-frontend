import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"

const api = create({ baseURL: "/objects" })
api.addMonitor(errorMonitor)

const createFromXML = async (objectType: string, XMLFile: string): Promise<any> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}`, formData)
}

const createFromJSON = async (objectType: string, JSONContent: any): Promise<any> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (objectType: string): Promise<any> => {
  return await api.get(`/${objectType}`)
}

const patchFromJSON = async (objectType: string, accessionId: string, JSONContent: any): Promise<any> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const replaceXML = async (objectType: string, accessionId: string, XMLFile: string): Promise<any> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromXML,
  createFromJSON,
  getObjectByAccessionId,
  getAllObjectsByObjectType,
  patchFromJSON,
  replaceXML,
  deleteObjectByAccessionId,
}
