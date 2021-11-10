//@flow
import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { getObjectDisplayTitle } from "utils"

const api = create({ baseURL: "/templates" })
api.addMonitor(errorMonitor)

const createTemplatesFromJSON = async (objectType: string, JSONContent: any): Promise<any> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getTemplateByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const patchTemplateFromJSON = async (objectType: string, accessionId: any, JSONContent: any): Promise<any> => {
  const draftTags = { tags: { displayTitle: getObjectDisplayTitle(objectType, JSONContent) } }
  return await api.patch(`/${objectType}/${accessionId}`, { ...omit(JSONContent, OmitObjectValues), draftTags })
}

const deleteTemplateByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createTemplatesFromJSON,
  getTemplateByAccessionId,
  patchTemplateFromJSON,
  deleteTemplateByAccessionId,
}
