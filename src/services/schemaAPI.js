//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/schemas" })

const getSchemaByObjectType = async (objectType: string) => {
  return await api.get(`/${objectType}`)
}

export default {
  getSchemaByObjectType,
}
