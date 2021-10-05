describe("unpublished folders, published folders, and user's draft templates pagination", function () {
  it("should renders pagination for unpublished folders list correctly", () => {
    // Mock responses for Unpublished Folders
    const unpublishedFoldersResponse10 = {
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
      page: { page: 1, size: 10, totalPages: 20, totalFolders: 200 },
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
      page: { page: 1, size: 10, totalPages: 4, totalFolders: 200 },
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
      page: { page: 2, size: 10, totalPages: 20, totalFolders: 200 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=10&published=false",
      },
      unpublishedFoldersResponse10
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
        url: "/folders?page=2&per_page=10&published=false",
      },
      unpublishedFoldersResponsePage2
    )

    // Mock response for Published Folders
    const publishedFoldersResponse10 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB6", metadataObjects: [], name: "Pub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB7", metadataObjects: [], name: "Pub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB8", metadataObjects: [], name: "Pub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB9", metadataObjects: [], name: "Pub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB10", metadataObjects: [], name: "Pub10", published: false },
      ],
      page: { page: 1, size: 10, totalPages: 8, totalFolders: 80 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=10&published=true",
      },
      publishedFoldersResponse10
    )
    cy.login()
    cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()
    cy.get("[data-testid='page info']").contains("1 of 20 pages").should("be.visible")

    // Click Next page button
    cy.get("button[aria-label='next page']").click()
    cy.get("p").contains("11-20 of 200", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='page info']", { timeout: 10000 }).contains("2 of 20 pages").should("be.visible")

    // Check "Items per page" options
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
    cy.get("li[data-value='10']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")
    cy.get("li[data-value='100']").should("be.visible")
    cy.get("li[data-value='200']").should("be.visible")
    // Select 50 items
    cy.get("li[data-value='50']").click()
    cy.get("ul > a", { timeout: 10000 }).should("have.length", "50")
    cy.get("p", { timeout: 10000 }).contains("1-50 of 200").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 4 pages").should("be.visible")
  })

  it("should renders pagination for unpublished folders list correctly", () => {
    // Mock response for Unpublished Folders
    const unpublishedFoldersResponse10 = {
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
      page: { page: 1, size: 10, totalPages: 20, totalFolders: 200 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=10&published=false",
      },
      unpublishedFoldersResponse10
    )

    // Mock responses for Published Folders
    const publishedFoldersResponse10 = {
      folders: [
        { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub1", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub2", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub3", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub4", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub5", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB6", metadataObjects: [], name: "Pub6", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB7", metadataObjects: [], name: "Pub7", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB8", metadataObjects: [], name: "Pub8", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB9", metadataObjects: [], name: "Pub9", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB10", metadataObjects: [], name: "Pub10", published: false },
      ],
      page: { page: 1, size: 10, totalPages: 8, totalFolders: 80 },
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
      page: { page: 1, size: 10, totalPages: 2, totalFolders: 80 },
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
      page: { page: 2, size: 10, totalPages: 20, totalFolders: 200 },
    }

    cy.intercept(
      {
        method: "GET",
        url: "/folders?page=1&per_page=10&published=true",
      },
      publishedFoldersResponse10
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
        url: "/folders?page=2&per_page=10&published=true",
      },
      publishedFoldersResponsePage2
    )

    cy.login()
    cy.get("button[data-testid='ViewAll-published']", { timeout: 10000 }).click()

    cy.get("[data-testid='page info']").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 8 pages").should("be.visible")
    // Click Next page button
    cy.get("button[aria-label='next page']").click()
    cy.get("p", { timeout: 10000 }).contains("11-20 of 80").should("be.visible")
    cy.get("[data-testid='page info']").contains("2 of 8 pages").should("be.visible")

    // Check "Items per page" options
    cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
    cy.get("li[data-value='10']").should("be.visible")
    cy.get("li[data-value='50']").should("be.visible")
    cy.get("li[data-value='80']").should("be.visible")

    // Select 50 items
    cy.get("li[data-value='50']").click()
    cy.get("ul > a", { timeout: 10000 }).should("have.length", "50")
    cy.get("p", { timeout: 10000 }).contains("1-50 of 80").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 2 pages").should("be.visible")
  })

  it("should render user's draft templates correctly", () => {
    cy.login()
    // Mock response for GET user
    const userResponse = {
      templates: [
        {
          accessionId: "TESTID1",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID2",
          schema: `template-sample`,
        },
        {
          accessionId: "TESTD3",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID4",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID5",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID6",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID7",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID8",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID9",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID10",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID11",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID12",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID13",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID14",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID15",
          schema: `template-study`,
        },
        {
          accessionId: "TESTID1",
          schema: `template-study`,
        },
      ],
      folders: [],
      name: "Test-user",
      userId: "USER1",
    }
    cy.intercept(
      {
        method: "GET",
        url: "/users/current",
      },
      userResponse
    )

    cy.login()
    // Check Draft-study pagination

    cy.get("div[data-schema='template-study'] > span").should("have.length", "10")
    cy.get("p").contains("1-10 of 15").should("be.visible")
    cy.get("[data-testid='page info']").contains("1 of 2 pages").should("be.visible")

    cy.get("div[data-testid='form-template-study']").within(() => {
      cy.get("button[aria-label='next page']").click()
      cy.get("p").contains("11-15 of 15", { timeout: 10000 }).should("be.visible")
      cy.get("[data-testid='page info']").contains("2 of 2 pages").should("be.visible")
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
    })
    cy.get("li[data-value='15']")
      .should("be.visible")
      .then($el => $el.click())
    cy.get("div[data-schema='template-study'] > span").should("have.length", "15")

    // Check Draft-sample pagination

    cy.get("div[data-schema='template-sample'] > span").should("have.length", "1")
    cy.get("p").contains("1-1 of 1").should("be.visible")
  })
})
