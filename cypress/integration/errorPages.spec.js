describe("catch error codes and display corresponding error page", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should redirect to 401 page if no granted access", () => {
    cy.visit(baseUrl + "folders")
    cy.contains(".MuiAlert-message", "401 Authorization Error")
  })

  it("should redirect to 403 page if response status code is 403 ", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/home",
      },
      {
        statusCode: 403,
      }
    )
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.contains(".MuiAlert-message", "403 Forbidden Error")
  })

  it("should redirect to 404 page on unknown route", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.visit(baseUrl + "home/unknownroute")
    cy.contains(".MuiAlert-message", "404 Not Found")
  })

  it("should redirect to 500 page if response status code is 500 ", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/home",
      },
      {
        statusCode: 500,
      }
    )
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.contains(".MuiAlert-message", "500 Internal Server Error", { timeout: 10000 })
  })
})
