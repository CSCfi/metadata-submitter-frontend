import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { APIResponse } from "types"

const api = create({ baseURL: "/drafts" })
api.addMonitor(errorMonitor)

const createFromJSON = async (
  objectType: string,
  folderId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.post(`/${objectType}?folder=${folderId}`, JSONContent)
}

const getObjectByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const patchFromJSON = async (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const getAllObjectsByObjectType = async (objectType: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}`)
}

const deleteObjectByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromJSON,
  getObjectByAccessionId,
  patchFromJSON,
  getAllObjectsByObjectType,
  deleteObjectByAccessionId,
}
