import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { APIResponse } from "types"

const api = create({ baseURL: "/objects" })
api.addMonitor(errorMonitor)

const createFromXML = async (objectType: string, XMLFile: File): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}`, formData)
}

const createFromJSON = async (objectType: string, JSONContent: Record<string, unknown>): Promise<APIResponse> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (objectType: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}`)
}

const patchFromJSON = async (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const replaceXML = async (objectType: string, accessionId: string, XMLFile: File): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
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
