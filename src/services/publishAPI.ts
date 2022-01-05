import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "/publish" })
api.addMonitor(errorMonitor)

const publishFolderById = async (folderId: string): Promise<APIResponse> => {
  return await api.patch(`/${folderId}`)
}

export default {
  publishFolderById,
}
