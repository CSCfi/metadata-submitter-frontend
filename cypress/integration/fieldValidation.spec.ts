describe("Field validation", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("should translate AJV validation messages according to locale", () => {
    cy.get("[data-testid='lang-selector']").should("contain", "en")

    cy.get("button").contains("Create submission").click()

    cy.newSubmission()

    cy.clickFillForm("Sample")

    cy.get("input[data-testid='sampleName.taxonId']").type("Test id").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "must be integer")

    cy.get("[data-testid='lang-selector']").click()
    cy.get("[data-testid='fi-lang']").contains("Fi").click()

    cy.get("input[data-testid='sampleName.taxonId']").type(" edit").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "täytyy olla kokonaisluku")
  })
})

export {}
