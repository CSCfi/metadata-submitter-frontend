import { describe, it, expect, vi } from "vitest"

import type { AppConfig } from "types"

const getConfig = async (): Promise<AppConfig> =>
  await fetch("/config.json").then(res => res.json())

describe("Config Loading", () => {
  it("should load config from config.json", async () => {
    const mockConfig = {
      APIP_REFIX: "/api",
    }

    // Mock fetch to return config
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as unknown as Response)
    )

    const config = await fetch("/config.json").then(res => res.json())

    expect(global.fetch).toHaveBeenCalledWith("/config.json")
    expect(config).toEqual(mockConfig)
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
