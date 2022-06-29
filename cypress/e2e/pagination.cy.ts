describe("unpublished submissions, published submissions, and user's draft templates pagination", function () {
  beforeEach(() => {
    cy.task("resetDb")
    const userResponse = {
      name: "test user",
      id: "USERID",
      projects: [
        { projectId: "PROJECT1", projectName: "Project 1" },
        { projectId: "PROJECT2", projectName: "Project 2" },
      ],
    }

    cy.intercept({ method: "GET", url: "/v1/users/current" }, userResponse)
  })
  it("should renders pagination for unpublished submissions list correctly", () => {
    // Mock responses for Unpublished Submissions
    const unpublishedSubmissionsResponse5 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 10, totalSubmissions: 50 },
    }

    const unpublishedSubmissionsResponse15 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub11", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub12", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub13", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub14", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub15", published: false },
      ],
      page: { page: 1, size: 15, totalPages: 4, totalSubmissions: 50 },
    }

    const unpublishedSubmissionsResponse25 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub11", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub12", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub13", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub14", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub15", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub16", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub17", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub18", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub19", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub20", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub21", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub22", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub23", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub24", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub25", published: false },
      ],
      page: { page: 1, size: 25, totalPages: 2, totalSubmissions: 50 },
    }

    const unpublishedSubmissionsResponse50 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 1, size: 50, totalPages: 1, totalSubmissions: 50 },
    }

    const unpublishedSubmissionsResponsePage2 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 2, size: 5, totalPages: 10, totalSubmissions: 50 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=5&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=15&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponse15
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=25&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponse25
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=50&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponse50
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=2&per_page=5&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponsePage2
    ).as("unpublishedPage2")

    // Mock response for Published Submissions
    const publishedSubmissionsResponse5 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 10, totalSubmissions: 50 },
    }

    const publishedSubmissionsResponse50 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
      ],
      page: { page: 1, size: 50, totalPages: 1, totalSubmissions: 50 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=5&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=50&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponse50
    )
    cy.login()
    cy.get("[data-testid='table-pagination']", { timeout: 10000 }).should("be.visible")

    cy.get("[data-testid='page info']", { timeout: 10000 }).contains("1 of 10 pages").should("be.visible")
    // Click Next page button
    cy.get("[data-testid='NavigateNextIcon']")
      .parent()
      .should("be.visible")
      .then($el => $el.click())

    cy.wait("@unpublishedPage2")

    cy.get("div[aria-haspopup='listbox']").contains(5, { timeout: 10000 }).as("button")
    cy.contains("6-10 of 50", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='page info']").contains("2 of 10 pages", { timeout: 10000 }).should("be.visible")
    // Check "Items per page" options
    cy.wait(0)
    cy.get("@button").then($el => {
      expect(Cypress.dom.isAttached($el).valueOf()).to.be.true
    })
    cy.get("@button").click()

    cy.get("li[data-value='5']", { timeout: 10000 }).should("be.visible")
    cy.get("li[data-value='15']").should("be.visible")
    cy.get("li[data-value='25']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")

    // Select 15 items
    cy.get("li[data-value='15']").click({ force: true })
    cy.get("p", { timeout: 10000 }).contains("1-15 of 50").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 4 pages").should("be.visible")

    // Select 25 items
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(15).click()
    cy.get("li[data-value='25']").click()
    cy.get("p", { timeout: 10000 }).contains("1-25 of 50").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 2 pages").should("be.visible")

    // Select 50 items
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(25).click()
    cy.get("li[data-value='50']").click()
    cy.get("p", { timeout: 10000 }).contains("1-50 of 50").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 1 pages").should("be.visible")
  })

  it("should render pagination for unpublished submissions list correctly", () => {
    // Mock responses for Unpublished Submissions
    const unpublishedSubmissionsResponse5 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 10, totalSubmissions: 5 },
    }
    // Mock responses for Published Submissions
    const publishedSubmissionsResponse5 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 1, totalSubmissions: 50 },
    }

    const publishedSubmissionsResponse50 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 1, size: 50, totalPages: 1, totalSubmissions: 50 },
    }

    const publishedSubmissionsResponsePage2 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
      ],
      page: { page: 2, size: 5, totalPages: 10, totalSubmissions: 50 },
    }

    const publishedSubmissionsResponsePage3 = {
      submissions: [
        { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
      ],
      page: { page: 3, size: 5, totalPages: 10, totalSubmissions: 50 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=5&published=false&projectId=PROJECT1",
      },
      unpublishedSubmissionsResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=5&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=1&per_page=50&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponse50
    )

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=2&per_page=5&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponsePage2
    ).as("publishedPage2")

    cy.intercept(
      {
        method: "GET",
        url: "/v1/submissions?page=3&per_page=5&published=true&projectId=PROJECT1",
      },
      publishedSubmissionsResponsePage3
    )

    cy.login()

    cy.get("[data-testid='published-tab']").click()

    cy.get("[data-testid='page info']").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 10 pages").should("be.visible")
    // Click Next page button
    cy.get("[data-testid='NavigateNextIcon']")
      .parent()
      .should("be.visible")
      .then($el => $el.click())
    cy.contains("6-10 of 50", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='page info']").contains("2 of 10 pages").should("be.visible")
    cy.wait("@publishedPage2")

    cy.wait(0)
    cy.get("button[aria-label='Go to page 3']")
      .then($el => {
        expect(Cypress.dom.isAttached($el).valueOf()).to.be.true
      })
      .click()
    cy.get("[data-testid='page info']").contains("3 of 10 pages").should("be.visible")

    // Check "Items per page" options
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(5).click()
    cy.get("li[data-value='5']").should("be.visible")
    cy.get("li[data-value='15']").should("be.visible")
    cy.get("li[data-value='25']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")

    // Select 50 items
    cy.get("li[data-value='50']").click()
    cy.get("p", { timeout: 10000 }).contains("1-50 of 50").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 1 pages").should("be.visible")
  }),
    it("should render pagination correctly when filtering the submission name", () => {
      const unpublishedPage1 = {
        submissions: [
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB1",
            metadataObjects: [],
            name: "draft-submission1",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        ],
        page: { page: 1, size: 5, totalPages: 6, totalSubmissions: 30 },
      }

      const unpublishedPage2 = {
        submissions: [
          { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        ],
        page: { page: 2, size: 5, totalPages: 6, totalSubmissions: 30 },
      }

      const unpublished15 = {
        submissions: [
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB1",
            metadataObjects: [],
            name: "draft-submission1",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "test3", published: false },
        ],
        page: { page: 1, size: 15, totalPages: 2, totalSubmissions: 30 },
      }

      const allUnpublished = {
        submissions: [
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB1",
            metadataObjects: [],
            name: "draft-submission1",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB6", metadataObjects: [], name: "test3", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB7", metadataObjects: [], name: "test4", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "test5", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "test6", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB1", metadataObjects: [], name: "test7", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB2", metadataObjects: [], name: "test8", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB3", metadataObjects: [], name: "test9", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB4", metadataObjects: [], name: "test10", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB5",
            metadataObjects: [],
            name: "this-draft",
            published: false,
          },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB6",
            metadataObjects: [],
            name: "draft-submission2",
            published: false,
          },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB7",
            metadataObjects: [],
            name: "draft-submission3",
            published: false,
          },
          { description: "d", drafts: [], submissionId: "UNPUB8", metadataObjects: [], name: "abc", published: false },
          { description: "d", drafts: [], submissionId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            description: "d",
            drafts: [],
            submissionId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
        ],
        page: { page: 1, size: 30, totalPages: 1, totalSubmissions: 30 },
      }

      // Mock responses for Published Submissions
      const publishedSubmissionsResponse5 = {
        submissions: [
          { description: "d", drafts: [], submissionId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
          { description: "d", drafts: [], submissionId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
          { description: "d", drafts: [], submissionId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
          { description: "d", drafts: [], submissionId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
          { description: "d", drafts: [], submissionId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        ],
        page: { page: 1, size: 5, totalPages: 1, totalSubmissions: 5 },
      }

      cy.intercept(
        {
          method: "GET",
          url: "/v1/submissions?page=1&per_page=5&published=false&projectId=PROJECT1",
        },
        unpublishedPage1
      )

      cy.intercept(
        {
          method: "GET",
          url: "/v1/submissions?page=2&per_page=5&published=false&projectId=PROJECT1",
        },
        unpublishedPage2
      )

      cy.intercept(
        {
          method: "GET",
          url: "/v1/submissions?page=1&per_page=30&published=false&projectId=PROJECT1",
        },
        allUnpublished
      )

      cy.intercept("DELETE", "/v1/submissions/UNPUB9", {
        statusCode: 200,
      }).as("deleteSubmission")

      cy.intercept(
        {
          method: "GET",
          url: "/v1/submissions?page=1&per_page=15&published=false&projectId=PROJECT1",
        },
        unpublished15
      ).as("unpublished15")

      cy.intercept(
        {
          method: "GET",
          url: "/v1/submissions?page=1&per_page=5&published=true&projectId=PROJECT1",
        },
        publishedSubmissionsResponse5
      )

      cy.login()
      cy.get("[data-testid='page info']").contains("1 of 6 pages").should("be.visible")

      // Type a filtering text and check if the filtered list renders correctly with pagination
      cy.get("input[data-testid='wizard-search-box']").type("test")
      cy.contains("1-5 of 10", { timeout: 10000 }).should("be.visible")
      cy.get("[data-testid='page info']").contains("1 of 2 pages").should("be.visible")
      cy.get("button[aria-label='Go to page 2']").click()
      cy.contains("test6", { timeout: 10000 }).should("be.visible")

      // Delete a submission and check that it is deleted from filtered list and the current page stays the same as page 2
      cy.get("[data-testid='delete-draft-submission']").eq(0).click()
      cy.wait("@deleteSubmission", { timeout: 6000 })
      cy.contains("test6", { timeout: 10000 }).should("not.exist")
      cy.get("button[aria-label='page 2']", { timeout: 10000 }).should("be.visible")

      // Select "Items per page" to check all filtered items exist
      cy.wait(0)
      cy.get("div[role='button']")
        .contains(5, { timeout: 10000 })
        .then($el => {
          expect(Cypress.dom.isAttached($el).valueOf()).to.be.true
        })
        .click()

      cy.get("li[data-value='15']").click()
      cy.wait("@unpublished15")
      cy.contains("1-9 of 9").should("be.visible")

      // Clear the filter and check that the pagination is back to normal to render all submissions
      cy.get("div[role='button']", { timeout: 10000 }).contains(15).click()
      cy.get("li[data-value='5']").click()
      cy.get("svg[data-testid='ClearIcon']").click()
      cy.get("input[data-testid='wizard-search-box']").should("have.value", "")

      cy.contains("1-5 of 30", { timeout: 10000 }).should("be.visible")
      cy.get("[data-testid='page info']").contains("1 of 6 pages").should("be.visible")

      // If the filtering text is not found, the table renders no pagination
      cy.get("input[data-testid='wizard-search-box']").type("123456")
      cy.get("[data-testid='table-pagination']").should("not.exist")
    })
})

export {}
