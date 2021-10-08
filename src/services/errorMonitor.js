// function to catch errors
export const errorMonitor = res => {
  // Exceptional case: replacing XML file with same name oftenly causes error. We don't redirect to 400 page but only show error message.
  const exceptionalCase = res.config.baseURL === "/objects" && res.config.method === "put"
  if (!res.ok && !exceptionalCase) {
    switch (res.status) {
      case 400:
        window.location = "/error400"
        break
      case 401:
        window.location = "/error401"
        break
      case 403:
        window.location = "/error403"
        break
      case 500:
        window.location = "/error500"
        break
      default:
        break
    }
  }
}
