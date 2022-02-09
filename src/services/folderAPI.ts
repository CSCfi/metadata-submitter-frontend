import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse, FolderDetails } from "types"

const api = create({ baseURL: "/folders" })

api.addMonitor(errorMonitor)

const createNewFolder = async (folder: FolderDetails): Promise<APIResponse> => {
  return await api.post("", folder)
}

const getFolderById = async (folderId: string): Promise<APIResponse> => {
  return await api.get(`/${folderId}`)
}

const patchFolderById = async (folderId: string, changes: Record<string, unknown>[]): Promise<APIResponse> => {
  return await api.patch(`/${folderId}`, changes)
}

const deleteFolderById = async (folderId: string): Promise<APIResponse> => {
  return await api.delete(`/${folderId}`)
}

const getFolders = async (params?: { page: number; per_page: number; published: boolean }): Promise<APIResponse> => {
  return await api.get("", params)
}

export default {
  createNewFolder,
  getFolderById,
  patchFolderById,
  deleteFolderById,
  getFolders,
}
