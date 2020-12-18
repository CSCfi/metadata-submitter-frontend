//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/schemas" })
api.addMonitor(errorMonitor)

const getSchemaByObjectType = async (objectType: string) => {
  return await api.get(`/${objectType}`)
}

export default {
  getSchemaByObjectType,
}
