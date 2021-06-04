describe("Login e2e", function () {
  beforeEach(() => {
    cy.setMockUser("frontend.test", "FrontendTest", "E2EUser")
  })

  const baseUrl = Cypress.env("baseUrl")

  it("should contain session cookie", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.getCookie("MTD_SESSION").should("exist")
  })

  it("should contain the test user name", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.get("div").contains("Logged in as: E2EUser FrontendTest")
  })

  it("should go to main page on logout", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.contains("Log out").click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq("/")
    })
  })
})
