//@flow
import { create } from "apisauce"

const api = create({ baseURL: "/publish" })

const publishFolderById = async (folderId: string) => {
  return await api.patch(`/${folderId}`)
}

export default {
  publishFolderById,
}
