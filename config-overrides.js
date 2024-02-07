module.exports = function override(config) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    path: require.resolve("path-browserify"),
  })
  return config
}
