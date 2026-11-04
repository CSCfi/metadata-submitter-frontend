import { APIResponse } from "../types"

import createApiClient from "./apiClient"

import { addApiPrefix } from "utils/getConfig"

const apiPath = await addApiPrefix("/v1/buckets")

const api = createApiClient(apiPath)

const getProjectBuckets = (projectId: string): Promise<APIResponse> => {
  return api.get("", { params: { projectId } })
}

const getBucketFiles = (projectId: string, bucketName: string): Promise<APIResponse> => {
  return api.get(`/${bucketName}/files/?projectId=${projectId}`)
}

// Grant access to a specific bucket
const grantAccessBucket = (projectId: string, bucketName: string): Promise<APIResponse> => {
  return api.put(`/${bucketName}?projectId=${projectId}`)
}

// Check if a specific bucket can be accessed
const checkAccessBucket = (projectId: string, bucketName: string): Promise<APIResponse> => {
  return api.head(`/${bucketName}?projectId=${projectId}`)
}

export default {
  getProjectBuckets,
  getBucketFiles,
  grantAccessBucket,
  checkAccessBucket,
}
