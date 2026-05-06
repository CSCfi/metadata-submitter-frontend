import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/buckets")
console.log("apiPath", apiPath)

const api = create({ baseURL: apiPath })
api.addMonitor(errorMonitor)

const getProjectBuckets = async (projectId: string): Promise<APIResponse> => {
  return await api.get("", { projectId })
}

const getBucketFiles = async (projectId: string, bucketName: string): Promise<APIResponse> => {
  return await api.get(`/${bucketName}/files/?projectId=${projectId}`)
}

// Grant access to a specific bucket
const grantAccessBucket = async (projectId: string, bucketName: string): Promise<APIResponse> => {
  return await api.put(`/${bucketName}?projectId=${projectId}`)
}

// Check if a specific bucket can be accessed
const checkAccessBucket = async (projectId: string, bucketName: string): Promise<APIResponse> => {
  return await api.head(`/${bucketName}?projectId=${projectId}`)
}

export default {
  getProjectBuckets,
  getBucketFiles,
  grantAccessBucket,
  checkAccessBucket,
}
