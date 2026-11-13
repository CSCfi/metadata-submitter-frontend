export const fixedConfig: string = "/api"

export const addApiPrefix = async (path: string): Promise<string> => {
  const normalizedPath = path.replace(/^\//, "")
  try {
    const url = new URL("/config.json", window.location.origin)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch config.json: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return `${data.API_PREFIX.replace(/\/$/, "")}/${normalizedPath}`
  } catch {
    return `${fixedConfig}/${normalizedPath}`
  }
}
