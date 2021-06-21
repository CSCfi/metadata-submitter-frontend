// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// File upload
import "cypress-file-upload"

// Reusable commands
const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

Cypress.Commands.add("setMockUser", (eppnUser, familyName, givenName) => {
  const mockAuthUrl = "http://" + Cypress.env("mockAuthHost") + ":" + Cypress.env("mockAuthPort") + "/setmock"

  cy.request({
    method: "GET",
    url: mockAuthUrl,
    qs: { eppn: eppnUser + "@test.fi", family: familyName, given: givenName },
  })
})

Cypress.Commands.add("login", () => {
  cy.visit(baseUrl)
  cy.get('[alt="CSC Login"]').click()
  cy.wait(1000)
})

Cypress.Commands.add("clickFillForm", objectType => {
  cy.get("div[role=button]").contains(objectType).click()
  cy.wait(500)
  cy.get("div[aria-expanded='true']")
    .siblings()
    .within(() =>
      cy
        .get("div[role=button]")
        .contains("Fill Form", { timeout: 10000 })
        .should("be.visible")
        .then($btn => $btn.click())
    )
})

Cypress.Commands.add("chooseFromDrafts", () => {
  cy.get("div[aria-expanded='true']")
    .siblings()
    .within(() =>
      cy
        .get("div[role=button]")
        .contains("Choose from drafts", { timeout: 10000 })
        .should("be.visible")
        .then($btn => $btn.click())
    )
})
