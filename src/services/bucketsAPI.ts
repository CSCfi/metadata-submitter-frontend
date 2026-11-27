import createApiClient from "./apiClient"

import { APIResponse, BucketFile } from "types"
import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/buckets")

const api = createApiClient(apiPath)

const getProjectBuckets = (projectId: string): Promise<APIResponse<string[]>> => {
  return api.get("", { params: { projectId } })
}

const getBucketFiles = (
  projectId: string,
  bucketName: string
): Promise<APIResponse<BucketFile[]>> => {
  return api.get(`/${bucketName}/files`, { params: { projectId } })
}

// Grant access to a specific bucket
const grantAccessBucket = (projectId: string, bucketName: string): Promise<APIResponse<void>> => {
  return api.put(`/${bucketName}`, undefined, { params: { projectId } })
}

// Check if a specific bucket can be accessed
const checkAccessBucket = (projectId: string, bucketName: string): Promise<APIResponse<void>> => {
  return api.head(`/${bucketName}`, { params: { projectId } })
}

export default {
  getProjectBuckets,
  getBucketFiles,
  grantAccessBucket,
  checkAccessBucket,
}
