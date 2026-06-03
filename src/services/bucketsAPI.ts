import { create } from "apisauce"

// For development, trying to access fiel without grants give 400 even visible
//import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/buckets")

const api = create({ baseURL: apiPath })
//api.addMonitor(errorMonitor)

const getProjectBuckets = async (projectId: string): Promise<APIResponse> => {
  console.log("APII", projectId)
  return await api.get("", { projectId })
}

const getBucketFiles = async (projectId: string, bucketName: string): Promise<APIResponse> => {
  console.log(`API get files /${bucketName}/files/?projectId=${projectId}`)
  const files = await api.get(`/${bucketName}/files/?projectId=${projectId}`)
  console.log("NONII", files.data)
  return files
}

// Grant access to a specific bucket
const grantAccessBucket = async (projectId: string, bucketName: string): Promise<APIResponse> => {
  console.log("APIgrant", bucketName)
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
