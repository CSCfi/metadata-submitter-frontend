//@flow
import { create } from "apisauce"

import { errorMonitor } from "./errorMonitor"

const api = create({ baseURL: "http://api.ror.org" })
api.addMonitor(errorMonitor)

const getOrganisations = async (searchTerm: string): Promise<any> => {
  const query = searchTerm?.length ? `?query=${searchTerm}` : ""

  return await api.get("/organizations" + query)
}

export default {
  getOrganisations,
}
