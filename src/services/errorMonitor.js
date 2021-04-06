// function to catch errors
export const errorMonitor = res => {
  if (!res.ok) {
    switch (res.status) {
      case 401:
        // window.location = "/error401"
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
