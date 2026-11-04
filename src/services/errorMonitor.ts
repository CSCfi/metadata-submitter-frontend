import { isAxiosError } from "axios"

// function to catch errors
export const errorMonitor = (err: unknown): void => {
  if (!isAxiosError(err)) {
    console.error("Unexpected behavior: ", err)
    return
  }
  /* Exceptional cases: 
    - replacing XML file with same name often causes error. 
    - invalid XML file returns 400.
    - publishing submission
    We don't redirect to 400 page but only show error message.
  */
  const exceptionalCase =
    (err.config?.url?.includes("/objects") && err.config?.method === "put") ||
    (err.config?.url?.includes("/validate") && err.config?.method === "post") ||
    err.config?.baseURL?.includes("/publish")

  if (exceptionalCase) return

  // Handle case when there is no HTTP response
  if (!err.response) {
    console.error("Unexpected error: network error or no responsed received", {
      url: err.config?.url,
      method: err.config?.method,
      message: err.message,
      code: err.code,
    })
    return
  }

  switch (err.response.status) {
    case 400:
      window.location.href = "/error400"
      break
    case 401:
      window.location.href = "/error401"
      break
    case 403:
      window.location.href = "/error403"
      break
    case 500:
      window.location.href = "/error500"
      break
    default:
      break
  }
}
