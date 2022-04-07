describe("Internationalization", function () {
  beforeEach(() => {
    cy.task("resetDb")
  })

  it("should login with finnish translation when finnish locale is chosen", () => {
    const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

    cy.visit(baseUrl)

    cy.get("[data-testid='lang-selector']").click()
    cy.get("[data-testid='fi-lang']").contains("Fi").click()

    cy.login()

    /* To be filled with new translation check later */
  })

  it("should change translation seamlessly", () => {
    cy.login()
    /* To be filled with new translation check later */
    cy.get("[data-testid='lang-selector']").click()
    cy.get("[data-testid='fi-lang']").contains("Fi").click()
    cy.url().should("include", "/fi/")
    /* To be filled with new translation check later */
  })

  it("should navigate with selected locale", () => {
    cy.login()

    cy.get("[data-testid='lang-selector']").click()
    cy.get("[data-testid='fi-lang']").contains("Fi").click()

    cy.get("button", { timeout: 10000 }).contains("Create submission").click()

    cy.url().should("include", "/fi/newdraft")
  })
})

export {}
