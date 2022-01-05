import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { APIResponse, ObjectDisplayValues } from "types"
import { getObjectDisplayTitle } from "utils"

const api = create({ baseURL: "/templates" })
api.addMonitor(errorMonitor)

const createTemplatesFromJSON = async (
  objectType: string,
  JSONContent: Record<string, unknown>[]
): Promise<APIResponse> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getTemplateByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const patchTemplateFromJSON = async (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  const draftTags = { tags: { displayTitle: getObjectDisplayTitle(objectType, JSONContent as ObjectDisplayValues) } }
  return await api.patch(`/${objectType}/${accessionId}`, { ...omit(JSONContent, OmitObjectValues), draftTags })
}

const deleteTemplateByAccessionId = async (objectType: string, accessionId: string): Promise<APIResponse> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createTemplatesFromJSON,
  getTemplateByAccessionId,
  patchTemplateFromJSON,
  deleteTemplateByAccessionId,
}
