//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/schemas" })
api.addMonitor(errorMonitor)

const getSchemaByObjectType = async (objectType: string): Promise<any> => {
  return await api.get(`/${objectType}`)
}

const getAllSchemas = async (): Promise<any> => {
  return await api.get()
}

export default {
  getSchemaByObjectType,
  getAllSchemas,
}
