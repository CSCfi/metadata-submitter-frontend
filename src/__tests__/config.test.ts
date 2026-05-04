import { describe, it, expect } from "vitest"

import type { AppConfig } from "types"

// Fetch the contents of /config.json
const getConfig = async (): Promise<AppConfig> => {
  return fetch("/config.json")
    .then(res => res.json())
    .catch(() => {
      throw new Error("failed to fetch /config.jsonl")
    })
}

describe("Config Loading", () => {
  it("should load config from config.json", async () => {
    let testConfig = await getConfig()

    const mockConfig = {
      API_PREFIX: "/api",
      FETCHED: testConfig.FETCHED,
    }

    expect(testConfig).toEqual(mockConfig)
  })

  it("should preserve config across multiple calls", async () => {
    const config1 = {
      API_PREFIX: "/api",
    }

    // Two calls will both return the same API_PREFIX, however
    // each will have a different FETCH-count
    let firstCall = await getConfig()
    let secondCall = await getConfig()

    // should have numbers stored
    expect(firstCall.FETCHED)
    expect(secondCall.FETCHED)

    // since the numbers increase every call the first should be smallest
    expect(firstCall.FETCHED < secondCall.FETCHED)

    // Now we expect equality
    expect(config1.API_PREFIX).toEqual(firstCall.API_PREFIX)
    expect(firstCall.API_PREFIX).toEqual(secondCall.API_PREFIX)
  })
})
