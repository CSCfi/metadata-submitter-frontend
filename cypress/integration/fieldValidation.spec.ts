import { ObjectTypes } from "constants/wizardObject"

describe("Field validation", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("should translate AJV validation messages according to locale", () => {
    cy.get("[data-testid='lang-selector']").should("contain", "en")

    cy.generateSubmissionAndObjects()
    cy.contains("Edit").click({ force: true })

    cy.clickAccordionPanel("Describe")

    cy.clickAddObject(ObjectTypes.sample)

    cy.get("input[data-testid='sampleName.taxonId']").type("Test id").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "must be integer")

    cy.get("[data-testid='lang-selector']").click()
    cy.get("[data-testid='fi-lang']").contains("Fi").click()

    cy.get("input[data-testid='sampleName.taxonId']").type(" edit").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "täytyy olla kokonaisluku")
  })
})

export {}
