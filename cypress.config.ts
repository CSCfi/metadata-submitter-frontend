import { defineConfig } from 'cypress'
import setupNodeEvents from './cypress/plugins/index.js'
//import { MongoClient } from "mongodb"

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
    setupNodeEvents,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    // setupNodeEvents(on, config) {
    //   const database = await MongoClient.connect("mongodb://admin:admin@localhost:27017")
    //   on("task", {
    //     resetDb() {
    //       const db = database.db("default")
    //       db.dropDatabase()
    //       return null
    //     },
    //   })
    // },
  },
  chromeWebSecurity: false,
})
