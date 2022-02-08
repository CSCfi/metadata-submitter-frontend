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

export {} // this file needs to be a module

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setMockUser(eppnUser: string, familyName: string, givenName: string): Chainable<Element>
      login(): Chainable<Element>
      newSubmission(folderName?: string): Chainable<Element>
      clickFillForm(objectType: string): Chainable<Element>
      continueFirstDraft(): Chainable<Element>
      findDraftFolder(label: string): Chainable<Element>
      openDOIForm(): Chainable<Element>
      formActions(buttonName: string): Chainable<Element>
    }
  }
}

// File upload
import "cypress-file-upload"

// Reusable commands
const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

Cypress.Commands.add("setMockUser", (subUser, familyName, givenName) => {
  const mockAuthUrl = "http://" + Cypress.env("mockAuthHost") + ":" + Cypress.env("mockAuthPort") + "/setmock"

  cy.request({
    method: "GET",
    url: mockAuthUrl,
    qs: { sub: subUser + "@test.fi", family: familyName, given: givenName },
  })
})

// Turn off all uncaught exception handling
Cypress.on("uncaught:exception", () => {
  return false
})

Cypress.Commands.add("login", () => {
  cy.visit(baseUrl)
  cy.get('a[data-testid="login-button"]').click()
  cy.get("[data-testid='link-create-submission'", { timeout: 10000 }).should("be.visible")
})

Cypress.Commands.add("newSubmission", folderName => {
  cy.intercept("/folders").as("newSubmission")
  cy.get("[data-testid='folderName']").type(folderName ? folderName : "Test name")
  cy.get("[data-testid='folderDescription']").type("Test description")
  cy.get("button[type=button]")
    .contains("Next")
    .should("be.visible")
    .then($el => $el.click())

  cy.wait("@newSubmission", { timeout: 10000 })
})

Cypress.Commands.add("clickFillForm", objectType => {
  cy.get("div[role=button]", { timeout: 10000 }).contains(objectType).click()
  cy.get("div[aria-expanded='true']")
    .siblings()
    .within(() =>
      cy
        .get("div[role=button]")
        .contains("Fill Form", { timeout: 10000 })
        .should("be.visible")
        .then($btn => $btn.click())
    )
  cy.get("form", { timeout: 30000 }).should("be.visible")
})

Cypress.Commands.add("continueFirstDraft", () => {
  cy.get("ul[data-testid='Draft-objects']")
    .find("li")
    .first()
    .within(() => {
      cy.get("button[aria-label='Edit submission']").first().click()
    })
  cy.contains("Update draft", { timeout: 10000 }).should("be.visible")
})

// Navigate to home & find folder from drafts
Cypress.Commands.add("findDraftFolder", label => {
  cy.get('a[aria-label="go to frontpage"]', { timeout: 10000 }).click()
  cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()
  cy.get("body").then(($body: JQuery<HTMLBodyElement>) => {
    if ($body.find("div[aria-haspopup='listbox']").length > 0) {
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
      cy.get("ul").children().last().contains("All").click()

      cy.get("ul[data-testid='draft-submissions']", { timeout: 30000 }).within(() => {
        cy.get("a").should("exist")
        cy.get("div[role=button]").should("be.visible")
        cy.get("div[role=button]")
          .last()
          .contains(label)
          .should("be.visible")
          .then($el => $el.click())
      })
    } else {
      cy.get("ul[data-testid='draft-submissions']").within(() => cy.get("div[role=button]").contains(label).click())
    }
  })
})

// Go to DOI form
Cypress.Commands.add("openDOIForm", () => {
  cy.get("div[role=button]").contains("Study").should("be.visible")
  cy.get("button[type=button]")
    .contains("Next")
    .should("be.visible")
    .then($el => $el.click())
  cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
  cy.get("div[role='dialog']").should("be.visible")
})

// Click Form's buttons to edit, clear or submit the form
Cypress.Commands.add("formActions", buttonName => {
  if (buttonName === "Submit") {
    cy.get("button[type=submit]").contains(buttonName).should("be.visible")
    cy.get("button[type=submit]").contains(buttonName).click({ timeout: 10000 })
  } else {
    cy.get("button[type=button]").contains(buttonName).should("be.visible")
    cy.get("button[type=button]").contains(buttonName).click({ timeout: 10000 })
  }
})
