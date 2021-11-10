import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/folders" })

api.addMonitor(errorMonitor)

const createNewFolder = async (folder: any): Promise<any> => {
  return await api.post("", folder)
}

const getFolderById = async (folderId: string): Promise<any> => {
  return await api.get(`/${folderId}`)
}

const patchFolderById = async (folderId: string, changes: any): Promise<any> => {
  return await api.patch(`/${folderId}`, changes)
}
const deleteFolderById = async (folderId: string): Promise<any> => {
  return await api.delete(`/${folderId}`)
}

const getFolders = async (params?: any): Promise<any> => {
  return await api.get("", params)
}

export default {
  createNewFolder,
  getFolderById,
  patchFolderById,
  deleteFolderById,
  getFolders,
}
