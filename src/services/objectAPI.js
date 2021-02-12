//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/objects" })
api.addMonitor(errorMonitor)

const createFromXML = async (objectType: string, XMLFile: string) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}`, formData)
}

const createFromJSON = async (objectType: string, JSONContent: any) => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string) => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (objectType: string) => {
  return await api.get(`/${objectType}`)
}

const patchFromJSON = async (objectType: string, accessionId: any, JSONContent: any) => {
  return await api.patch(`/${objectType}/${accessionId}`, JSONContent)
}

const replaceXML = async (objectType: string, accessionId: string, XMLFile: string) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string) => {
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
