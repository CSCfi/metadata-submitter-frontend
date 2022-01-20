/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MongoClient } from "mongodb"

module.exports = async on => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  const database = await MongoClient.connect("mongodb://admin:admin@localhost:27017")
  on("task", {
    resetDb() {
      const db = database.db("default")
      db.dropDatabase()
      return null
    },
  })
}
