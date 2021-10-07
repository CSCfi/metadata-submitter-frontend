//@flow
import { create } from "apisauce"
// import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

// import { OmitObjectValues } from "constants/wizardObject"

const api = create({ baseURL: "/templates" })
api.addMonitor(errorMonitor)

const createTemplatesFromJSON = async (objectType: string, JSONContent: any): Promise<any> => {
  return await api.post(`/${objectType}`, JSONContent)
}

const getTemplateByAccessionId = async (objectType: string, accessionId: string): Promise<any> => {
  return await api.get(`/${objectType}/${accessionId}`)
}

export default {
  createTemplatesFromJSON,
  getTemplateByAccessionId,
}
