import { isAxiosError } from "axios"

/* Exceptional cases where we don't redirect to an error page but only show an error message:
  - replacing XML file with same name often causes error.
  - invalid XML file returns 400.
  - bucket HEAD request
  - publishing submission
*/
const exceptionalRequests: { baseURL: string; method: string }[] = [
  { baseURL: "/objects", method: "put" },
  { baseURL: "/validate", method: "post" },
  { baseURL: "/buckets", method: "head" },
  { baseURL: "/publish", method: "patch" },
]

const errorPages: Record<number, string> = {
  400: "/error400",
  401: "/error401",
  403: "/error403",
  500: "/error500",
}

export const errorMonitor = (err: unknown): void => {
  if (!isAxiosError(err)) {
    console.error("Unexpected behavior: ", err)
    return
  }

  const { url, method, baseURL } = err.config ?? {}

  const exceptionalCase = exceptionalRequests.some(
    req => baseURL?.includes(req.baseURL) && method === req.method
  )
  if (exceptionalCase) return

  // Handle case when there is no HTTP response
  if (!err.response) {
    console.error("Unexpected error: network error or no responsed received", {
      url,
      method,
      message: err.message,
      code: err.code,
    })
    return
  }

  const errorPage = errorPages[err.response.status]
  if (errorPage) window.location.href = errorPage
}
