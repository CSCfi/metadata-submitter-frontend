//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "/publish" })
api.addMonitor(errorMonitor)

const publishFolderById = async (folderId: string) => {
  return await api.patch(`/${folderId}`)
}

export default {
  publishFolderById,
}
