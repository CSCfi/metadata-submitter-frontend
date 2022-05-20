import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "" })
api.addMonitor(errorMonitor)

const validateXMLFile = async (objectType: string, XMLFile: string | Blob): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post("/validate", formData)
}

export default { validateXMLFile }
