describe("Internationalization", function () {
  it("should login with finnish translation when finnish locale is chosen", () => {
    const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

    cy.visit(baseUrl)

    cy.get("#lang-selector").click()
    cy.get("li[role=menuitem]").contains("Fi").click()

    cy.get('[alt="CSC Login"]').click()
    cy.wait(1000)

    cy.get("[data-testid='logged-in-as'").contains("Kirjautuneena")
  })

  it("should change translation seamlessly", () => {
    cy.login()

    cy.get("[data-testid='logged-in-as'").contains("Logged in as")

    cy.get("#lang-selector").click()
    cy.get("li[role=menuitem]").contains("Fi").click()
    cy.url().should("include", "/fi/")

    cy.get("[data-testid='logged-in-as'").contains("Kirjautuneena")
  })

  it("should navigate with selected locale", () => {
    cy.login()

    cy.get("#lang-selector").click()
    cy.get("li[role=menuitem]").contains("Fi").click()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    cy.url().should("include", "/fi/newdraft")
  })
})

export {}
