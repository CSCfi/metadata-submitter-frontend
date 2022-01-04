import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "http://api.ror.org" })
api.addMonitor(errorMonitor)

const getOrganisations = async (searchTerm: string): Promise<any> => {
  return await api.get("/organizations", { query: searchTerm })
}

export default {
  getOrganisations,
}
