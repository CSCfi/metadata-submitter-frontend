//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/folders" })

const createNewFolder = async (folder: any) => {
  return await api.post(null, folder)
}

const getFolderById = async (folderId: string) => {
  return await api.get(`/${folderId}`)
}

const patchFolderById = async (folderId: string, changes: any) => {
  return await api.get(`/${folderId}`, changes)
}

export default {
  createNewFolder,
  getFolderById,
  patchFolderById,
}
