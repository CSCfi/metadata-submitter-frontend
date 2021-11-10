describe("Login e2e", function () {
  beforeEach(() => {
    cy.setMockUser("frontend.test", "FrontendTest", "E2EUser")
  })

  it("should contain session cookie", () => {
    cy.login()
    cy.getCookie("MTD_SESSION").should("exist")
  })

  it("should contain the test user name", () => {
    cy.login()
    cy.get("div").contains("Logged in as: E2EUser FrontendTest")
  })

  it("should go to main page on logout", () => {
    cy.login()
    cy.contains("Log out").click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq("/")
    })
  })
})

export {}
