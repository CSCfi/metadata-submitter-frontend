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
    cy.get("[data-testid='user-setting-button']").contains("E2EUser FrontendTest")
  })

  it("should go to main page on logout", () => {
    cy.login()
    cy.get("[data-testid='user-setting-button']").click()
    cy.contains("Log out").click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq("/")
    })
  })
})

export {}
