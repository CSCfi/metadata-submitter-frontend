import { APIResponse, FintoSearchResponse } from "../types"

import createApiClient from "./apiClient"

const apiPath = "https://api.finto.fi/rest/v1"
const api = createApiClient(apiPath)

/*
 * Search places from the YSO places ontology (yso-paikat).
 * More info: https://api.finto.fi/doc/
 */
const getPlaces = (
  searchTerm: string,
  lang = "en",
  maxhits = 20
): Promise<APIResponse<FintoSearchResponse>> => {
  // Finto search requires a wildcard for prefix matching
  const query = searchTerm.endsWith("*") ? searchTerm : `${searchTerm}*`
  return api.get("/search", { params: { query, vocab: "yso-paikat", lang, maxhits } })
}

export default {
  getPlaces,
}
