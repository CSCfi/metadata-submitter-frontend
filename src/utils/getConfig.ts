export const fixedConfig: string = "/api"

export const addApiPrefix = async (path: string): Promise<string> => {
  // Catching an error when failing in promise is offering an escape for Vitest having no fetch
  const url = new URL("/config.json", window.location.origin)
  const apiPrefix: string = await fetch(url)
    .then(res => res.json())
    .then(data => data.API_PREFIX)

  return `${apiPrefix.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}
