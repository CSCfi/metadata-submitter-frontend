import { defineConfig } from "cypress"
import { MongoClient } from "mongodb"

export default defineConfig({
  env: {
    port: "3000",
    mockAuthHost: "localhost",
    mockAuthPort: "8000",
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
  videoCompression: false,
  defaultCommandTimeout: 10000,
  e2e: {
    supportFile: "cypress/support/e2e.ts",

    setupNodeEvents(on) {
      on("task", {
        async resetDb() {
          const database = await MongoClient.connect("mongodb://admin:admin@localhost:27017")

          const db = database.db("default")
          db.dropDatabase()
          return null
        },
      })
    },
  },
})
