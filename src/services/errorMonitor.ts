import { APIResponse } from "types"

// function to catch errors
export const errorMonitor = (res: APIResponse) => {
  /* Exceptional cases: 
    - replacing XML file with same name often causes error. 
    - invalid XML file returns 400.
    We don't redirect to 400 page but only show error message.
  */
  const exceptionalCase =
    (res.config?.url?.includes("/objects") && res.config?.method === "put") ||
    (res.config?.url?.includes("/validate") && res.config?.method === "post")

  if (!res.ok && !exceptionalCase) {
    switch (res.status) {
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
}
