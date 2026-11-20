import createApiClient from "./apiClient"

import { APIResponse, RORSearchResponse } from "types"

const apiPath = "https://api.ror.org"
const api = createApiClient(apiPath)

// Only selected fields are used from the ROR v2 search response, see types/index.ts
const getOrganisations = (searchTerm: string): Promise<APIResponse<RORSearchResponse>> => {
  return api.get("/organizations", { params: { query: searchTerm } })
}

export default {
  getOrganisations,
}
