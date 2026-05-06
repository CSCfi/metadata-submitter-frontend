import "@testing-library/jest-dom/vitest"

// Number of mocked fetches
let fetchCount = 0

// mock all URL fetches, but rewrite the values of anything
// that ends with /config.json to return a temporary object.
global.fetch = vi.fn((input: RequestInfo | URL) => {
  const href =
    typeof input === "string" ? input : input instanceof URL ? input.href : input.toString()

  if (href.endsWith("/config.json")) {
    fetchCount++

    return Promise.resolve({
      ok: true,
      json: async () => ({
        API_PREFIX: "/api",
        FETCHED: fetchCount,
      }),
    } as Response)
  }

  return Promise.reject(new Error(`Unhandled fetch: ${input}`))
}) as AppConfig
