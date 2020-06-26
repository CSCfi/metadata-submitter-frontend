//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/objects" })

const createFromXML = async (objectType: string, XMLFile: Object) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}`, formData)
}

const getObjectByAccessionId = async (
  objectType: string,
  accessionId: string
) => {
  return await api.get(`/${objectType}/${accessionId}`)
}

const getAllObjectsByObjectType = async (objectType: string) => {
  return await api.get(`/${objectType}`)
}

export default {
  createFromXML,
  getObjectByAccessionId,
  getAllObjectsByObjectType,
}
