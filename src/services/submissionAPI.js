//@flow
import { create } from "apisauce"

const api = create({ baseURL: "" })

const validateXMLFile = async (objectType: string, XMLFile: any) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post("/validate", formData)
}

export default { validateXMLFile }
