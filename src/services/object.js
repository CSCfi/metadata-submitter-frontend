import { create } from "apisauce"

const api = create({
  baseURL: "/object",
})

const createFromXML = async (objectType, XMLFile) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}`, formData)
}

export default { createFromXML }
