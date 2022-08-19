describe("catch error codes and display corresponding error page", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  // it("should redirect to 400 page if response status code is 400 ", () => {
  //   cy.login()
  //   cy.visit(baseUrl + "/v1/objects/study?page=asdf")
  //   cy.contains(".MuiAlert-message", "400 Bad Request", { timeout: 10000 })
  // })

  it("should redirect to 401 page if no granted access", () => {
    cy.visit(baseUrl + "/v1/submissions")
    cy.contains(".MuiAlert-message", "401 Authorization Error")
  })

  it("should redirect to 403 page if response status code is 403 ", () => {
    cy.intercept("GET", "/v1/submissions*", {
      statusCode: 403,
      body: "Error 403",
    })
    cy.login()
    cy.contains(".MuiAlert-message", "403 Forbidden Error")
  })

  it("should redirect to 404 page on unknown route", () => {
    cy.login()
    cy.visit(baseUrl + "home/unknownroute")
    cy.contains(".MuiAlert-message", "404 Not Found")
  })

  it("should redirect to 500 page if response status code is 500 ", () => {
    cy.intercept("GET", "/v1/submissions*", {
      statusCode: 500,
      body: "Error 500",
    })
    cy.login()
    cy.contains(".MuiAlert-message", "500 Internal Server Error", { timeout: 10000 })
  })
})

export {}
