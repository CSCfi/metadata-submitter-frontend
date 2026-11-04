import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/validate")

const api = createApiClient(apiPath)

const validateXMLFile = (objectType: string, XMLFile: string | Blob): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return api.post(apiPath, formData)
}

export default { validateXMLFile }
