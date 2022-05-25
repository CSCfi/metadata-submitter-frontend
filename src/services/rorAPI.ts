import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

import { APIResponse } from "types"

const api = create({ baseURL: "https://api.ror.org" })
api.addMonitor(errorMonitor)

const getOrganisations = async (searchTerm: string): Promise<APIResponse> => {
  return await api.get("/organizations", { query: searchTerm })
}

export default {
  getOrganisations,
}
