import { omit } from "lodash"

import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { OmitObjectValues } from "constants/wizardObject"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/objects")

/* NB:
  - '/v1/object' endpoint is already removed from backend, but we will need a replacement for it in the end
  to add an (metadata) object to a submission and update it.
  - The functions below are left as is so we could update them/have them as template when the new endpoints are available.
  - 'getAllObjectsByObjectType' and 'getObjectByObjectId' are moved to 'submissionAPI'.
*
*/
const api = createApiClient(apiPath)

const createFromXML = (
  objectType: string,
  submissionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return api.post(`/${objectType}?submission=${submissionId}`, formData)
}

/*
  Backend now supports creating multiple objects at once, the response is an Array of objects.
  Frontend only creates one object at a time atm but we may support this multi-object feature also in the future.
*/
const createFromJSON = (
  objectType: string,
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return api.post(`/${objectType}?submission=${submissionId}`, JSONContent)
}

const patchFromJSON = (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const replaceXML = (
  objectType: string,
  accessionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = (
  objectType: string,
  accessionId: string
): Promise<APIResponse> => {
  return api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromXML,
  createFromJSON,
  patchFromJSON,
  replaceXML,
  deleteObjectByAccessionId,
}
