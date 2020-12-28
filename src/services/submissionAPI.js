//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "" })
api.addMonitor(errorMonitor)

const validateXMLFile = async (objectType: string, XMLFile: any) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post("/validate", formData)
}

export default { validateXMLFile }
