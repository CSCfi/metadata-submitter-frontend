/*
Proxy for development usage. All the paths that should be forwarded to backend should be added here.
React handles proxy logic in the background, see https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/
const { createProxyMiddleware } = require("http-proxy-middleware")
const proxy = process.env.REACT_APP_BACKEND_PROXY || "localhost:5430"

module.exports = function (app) {
  app.use(
    ["/objects", "/schemas", "/validate", "/submit", "/folders", "/drafts", "/aai", "/callback", "/logout"],
    createProxyMiddleware({
      target: `http://${proxy}`,
      changeOrigin: true,
    })
  )
}
