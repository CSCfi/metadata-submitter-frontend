/*
Proxy for development usage. All the paths that should be forwarded to backend should be added here.
React handles proxy logic in the background, see https://create-react-app.dev/docs/proxying-api-requests-in-development/
*/

/*
 * Note: Proxy can't be setup with TypeScript yet.
 * Possible solution can be found in: https://stackoverflow.com/questions/54639619/custom-proxy-in-create-react-app-using-typescript
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require("http-proxy-middleware")
const proxy = process.env.REACT_APP_BACKEND_PROXY || "localhost:5430"

module.exports = function (app) {
  app.use(
    [
      "/v1/objects",
      "/v1/schemas",
      "/v1/validate",
      "/v1/submit",
      "/v1/submissions",
      "/v1/publish",
      "/v1/drafts",
      "/aai",
      "/callback",
      "/logout",
      "/v1/users",
      "/v1/templates",
    ],
    createProxyMiddleware({
      target: `http://${proxy}`,
      changeOrigin: true,
    })
  )
}
