/* eslint no-undef: 0 */
/* Setup proxy for development usage. Disable eslint rule, since react handles
 * importing logic on the background. */

const { createProxyMiddleware } = require("http-proxy-middleware")

const proxy = process.env.REACT_APP_BACKEND_PROXY || "localhost:5430"

module.exports = function (app) {
  app.use(
    ["/objects", "/schemas", "/validate", "/submit", "/folders", "/drafts"],
    createProxyMiddleware({
      target: `http://${proxy}`,
      changeOrigin: true,
    })
  )
}
