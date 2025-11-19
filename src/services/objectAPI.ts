import { create } from "apisauce"
import { omit } from "lodash"

import { errorMonitor } from "./errorMonitor"

import { OmitObjectValues } from "constants/wizardObject"
import { APIResponse } from "types"

/* NB: 
  - '/v1/object' endpoint is already removed from backend, but we will need a replacement for it in the end
  to add an (metadata) object to a submission and update it.
  - The functions below are left as is so we could update them/have them as template when the new endpoints are available.
  - 'getAllObjectsByObjectType' and 'getObjectByObjectId' are moved to 'submissionAPI'.
*
*/
const api = create({ baseURL: "/v1/objects" })
api.addMonitor(errorMonitor)

const createFromXML = async (
  objectType: string,
  submissionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.post(`/${objectType}?submission=${submissionId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

/*
  Backend now supports creating multiple objects at once, the response is an Array of objects.
  Frontend only creates one object at a time atm but we may support this multi-object feature also in the future.
*/
const createFromJSON = async (
  objectType: string,
  submissionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.post(`/${objectType}?submission=${submissionId}`, JSONContent)
}

const patchFromJSON = async (
  objectType: string,
  accessionId: string,
  JSONContent: Record<string, unknown>
): Promise<APIResponse> => {
  return await api.patch(`/${objectType}/${accessionId}`, omit(JSONContent, OmitObjectValues))
}

const replaceXML = async (
  objectType: string,
  accessionId: string,
  XMLFile: File
): Promise<APIResponse> => {
  const formData = new FormData()
  formData.append(objectType, XMLFile)
  return await api.put(`/${objectType}/${accessionId}`, formData)
}

const deleteObjectByAccessionId = async (
  objectType: string,
  accessionId: string
): Promise<APIResponse> => {
  return await api.delete(`/${objectType}/${accessionId}`)
}

export default {
  createFromXML,
  createFromJSON,
  patchFromJSON,
  replaceXML,
  deleteObjectByAccessionId,
}
