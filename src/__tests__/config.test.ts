import { describe, it, expect, vi } from "vitest"

import type { AppConfig } from "types"

const url = new URL("/config.json", window.location.origin)
const getConfig = async (): Promise<AppConfig> => await fetch(url).then(res => res.json())

const testConfig = await getConfig()

describe("Config Loading", () => {
  it("should load config from config.json", async () => {
    const mockConfig = {
      API_PREFIX: "/api",
    }

    // Mock fetch to return config
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as unknown as Response)
    )

    expect(testConfig).toEqual(mockConfig)
  })

  it("should preserve config across multiple calls", async () => {
    const config1 = {
      API_PREFIX: "/api",
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(config1),
      } as unknown as Response)
    )

    const firstCall = await getConfig()
    const secondCall = await getConfig()

    expect(firstCall).toEqual(secondCall)
    expect(firstCall).toEqual(config1)
  })
})
