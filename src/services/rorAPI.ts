import { APIResponse } from "../types"

import createApiClient from "./apiClient"

const apiPath = "https://api.ror.org"
const api = createApiClient(apiPath)

const getOrganisations = (searchTerm: string): Promise<APIResponse> => {
  return api.get("/organizations", { params: { query: searchTerm } })
}

export default {
  getOrganisations,
}
