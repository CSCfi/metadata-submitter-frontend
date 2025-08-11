import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { APIResponse } from "types"

const api = create({ baseURL: "/v1/objects" })
api.addMonitor(errorMonitor)

const createFromXML = async (
  objectType: string,
  submissionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}?submission=${submissionId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

/*
  Backend now supports creating multiple objects at once, the response is an Array of objects.
  Frontend only creates one object at a time atm but we may support this multi-object feature also in the future.
*/
const createFromJSON = async (
  objectType: string,
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.post(`/${objectType}?submission=${submissionId}`, JSONContent)
}

const getObjectByAccessionId = async (
  objectType: string,
  accessionId: string
): Promise<APIResponse> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (
  objectType: string,
  submissionId: string
): Promise<APIResponse> => {
  return await api.get(`/${objectType}?submission=${submissionId}`)
}

const patchFromJSON = async (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const replaceXML = async (
  objectType: string,
  accessionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = async (
  objectType: string,
  accessionId: string
): Promise<APIResponse> => {
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
