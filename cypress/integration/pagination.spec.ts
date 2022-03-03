describe("unpublished folders, published folders, and user's draft templates pagination", function () {
  beforeEach(() => cy.task("resetDb"))
  it("should renders pagination for unpublished folders list correctly", () => {
    // Mock responses for Unpublished Folders
    const unpublishedFoldersResponse5 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 20, totalFolders: 100 },
    }

    const unpublishedFoldersResponse15 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub11", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub12", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub13", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub14", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub15", published: false },
      ],
      page: { page: 1, size: 15, totalPages: 7, totalFolders: 100 },
    }

    const unpublishedFoldersResponse25 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub11", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub12", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub13", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub14", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub15", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub16", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub17", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub18", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub19", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub20", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub21", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub22", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub23", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub24", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub25", published: false },
      ],
      page: { page: 1, size: 25, totalPages: 4, totalFolders: 100 },
    }

    const unpublishedFoldersResponse50 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 1, size: 50, totalPages: 2, totalFolders: 100 },
    }

    const unpublishedFoldersResponsePage2 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 2, size: 5, totalPages: 20, totalFolders: 100 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=5&published=false",
      },
      unpublishedFoldersResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=15&published=false",
      },
      unpublishedFoldersResponse15
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=25&published=false",
      },
      unpublishedFoldersResponse25
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=50&published=false",
      },
      unpublishedFoldersResponse50
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=2&per_page=5&published=false",
      },
      unpublishedFoldersResponsePage2
    ).as("unpublishedPage2")

    // Mock response for Published Folders
    const publishedFoldersResponse5 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 20, totalFolders: 100 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=5&published=true",
      },
      publishedFoldersResponse5
    )
    cy.login()
    cy.get("[data-testid='table-pagination']", { timeout: 10000 }).should("be.visible")

    cy.get("[data-testid='page info']", { timeout: 10000 }).contains("1 of 20 pages").should("be.visible")
    // Click Next page button
    cy.get("[data-testid='NavigateNextIcon']")
      .parent()
      .should("be.visible")
      .then($el => $el.click())

    cy.wait("@unpublishedPage2")

    cy.get("div[aria-haspopup='listbox']").contains(5, { timeout: 10000 }).as("button")
    cy.contains("6-10 of 100", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='page info']").contains("2 of 20 pages", { timeout: 10000 }).should("be.visible")
    // Check "Items per page" options
    cy.wait(0)
    cy.get("@button")
      .then($el => {
        expect(Cypress.dom.isAttached($el).valueOf()).to.be.true
      })
      .click()

    cy.get("li[data-value='5']", { timeout: 10000 }).should("be.visible")
    cy.get("li[data-value='15']").should("be.visible")
    cy.get("li[data-value='25']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")

    // Select 15 items
    cy.get("li[data-value='15']").click({ force: true })
    cy.get("p", { timeout: 10000 }).contains("1-15 of 100").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 7 pages").should("be.visible")

    // Select 25 items
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(15).click()
    cy.get("li[data-value='25']").click()
    cy.get("p", { timeout: 10000 }).contains("1-25 of 100").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 4 pages").should("be.visible")

    // Select 50 items
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(25).click()
    cy.get("li[data-value='50']").click()
    cy.get("p", { timeout: 10000 }).contains("1-50 of 100").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 2 pages").should("be.visible")
  })

  it("should render pagination for unpublished folders list correctly", () => {
    // Mock responses for Published Folders
    const publishedFoldersResponse5 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
      ],
      page: { page: 1, size: 5, totalPages: 30, totalFolders: 150 },
    }

    const publishedFoldersResponse50 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 1, size: 50, totalPages: 3, totalFolders: 150 },
    }

    const publishedFoldersResponsePage2 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 2, size: 5, totalPages: 30, totalFolders: 150 },
    }

    const publishedFoldersResponsePage3 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub10", published: false },
      ],
      page: { page: 3, size: 5, totalPages: 30, totalFolders: 150 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=5&published=true",
      },
      publishedFoldersResponse5
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=50&published=true",
      },
      publishedFoldersResponse50
    )

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=2&per_page=5&published=true",
      },
      publishedFoldersResponsePage2
    ).as("publishedPage2")

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=3&per_page=5&published=true",
      },
      publishedFoldersResponsePage3
    )

    cy.login()

    cy.get("[data-testid='published-tab']").click()

    cy.get("[data-testid='page info']").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 30 pages").should("be.visible")
    // Click Next page button
    cy.get("[data-testid='NavigateNextIcon']")
      .parent()
      .should("be.visible")
      .then($el => $el.click())
    cy.contains("6-10 of 150", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='page info']").contains("2 of 30 pages").should("be.visible")
    cy.wait("@publishedPage2")
    cy.get("button[aria-label='Go to page 3']").click()

    cy.get("[data-testid='page info']").contains("3 of 30 pages").should("be.visible")

    // Check "Items per page" options
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(5).click()
    cy.get("li[data-value='5']").should("be.visible")
    cy.get("li[data-value='15']").should("be.visible")
    cy.get("li[data-value='25']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")

    // Select 50 items
    cy.get("li[data-value='50']").click()
    cy.get("p", { timeout: 10000 }).contains("1-50 of 150").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 3 pages").should("be.visible")
  }),
    it("should render pagination correctly when filtering the submission name", () => {
      const unpublishedPage1 = {
        folders: [
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB1",
            metadataObjects: [],
            name: "draft-folder1",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
        ],
        page: { page: 1, size: 5, totalPages: 6, totalFolders: 30 },
      }

      const unpublishedPage2 = {
        folders: [
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
        ],
        page: { page: 2, size: 5, totalPages: 6, totalFolders: 30 },
      }

      const unpublished15 = {
        folders: [
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB1",
            metadataObjects: [],
            name: "draft-folder1",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "test3", published: false },
        ],
        page: { page: 1, size: 15, totalPages: 2, totalFolders: 30 },
      }

      const allUnpublished = {
        folders: [
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB1",
            metadataObjects: [],
            name: "draft-folder1",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "test", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Biology", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "test2", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub6", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub7", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub8", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub1", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub2", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub3", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub4", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub5", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "test3", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "test4", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "test5", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "test6", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "test7", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "test8", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "test9", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "test10", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB5",
            metadataObjects: [],
            name: "this-draft",
            published: false,
          },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB6",
            metadataObjects: [],
            name: "draft-folder2",
            published: false,
          },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB7",
            metadataObjects: [],
            name: "draft-folder3",
            published: false,
          },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "abc", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub9", published: false },
          {
            descriptioni: "d",
            drafts: [],
            folderId: "UNPUB10",
            metadataObjects: [],
            name: "Unpub10",
            published: false,
          },
        ],
        page: { page: 1, size: 30, totalPages: 1, totalFolders: 30 },
      }

      cy.intercept(
        {
          method: "GET",
          url: "/folders?page=1&per_page=5&published=false",
        },
        unpublishedPage1
      )

      cy.intercept(
        {
          method: "GET",
          url: "/folders?page=2&per_page=5&published=false",
        },
        unpublishedPage2
      )

      cy.intercept(
        {
          method: "GET",
          url: "/folders?page=1&per_page=30&published=false",
        },
        allUnpublished
      )

      cy.intercept("DELETE", "/folders/UNPUB9", {
        statusCode: 200,
      }).as("deleteSubmission")

      cy.intercept(
        {
          method: "GET",
          url: "/folders?page=1&per_page=15&published=false",
        },
        unpublished15
      ).as("unpublished15")

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
