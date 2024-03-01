/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack")

module.exports = function override(config) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    path: require.resolve("path-browserify"),
    util: require.resolve("util/"),
    fs: require.resolve("browserify-fs"),
    buffer: require.resolve("buffer"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    url: require.resolve("url"),
  })
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
  ])
  return config
}
