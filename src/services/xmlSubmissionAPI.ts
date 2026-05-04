import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/validate")

const api = create({ baseURL: "" })
api.addMonitor(errorMonitor)

const validateXMLFile = async (
  objectType: string,
  XMLFile: string | Blob
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(apiPath, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export default { validateXMLFile }
