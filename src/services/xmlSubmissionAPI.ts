import createApiClient from "./apiClient"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/validate")

/*
  - '/v1/validate' endpoint does not exist in backend
  - API response is set to void, for not knowing what type it should be, if not void
*
*/

const api = createApiClient(apiPath)

const validateXMLFile = (
  objectType: string,
  XMLFile: string | Blob
): Promise<APIResponse<void>> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return api.post("", formData)
}

export default { validateXMLFile }
