import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    port: '3000',
    mockAuthHost: 'localhost',
    mockAuthPort: '8000',
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
  videoCompression: false,
  defaultCommandTimeout: 10000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
