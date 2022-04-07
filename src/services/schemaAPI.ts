import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/schemas" })
api.addMonitor(errorMonitor)

const getSchemaByObjectType = async (objectType: string): Promise<APIResponse> => {
  return await api.get(`/${objectType}`)
}

const getAllSchemas = async (): Promise<APIResponse> => {
  return await api.get("")
}

export default {
  getSchemaByObjectType,
  getAllSchemas,
}
