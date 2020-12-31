describe("Basic e2e", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should navigate to home with click of login button", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
  })

  it("should create new folder, add study form and publish folder", () => {
    cy.visit(baseUrl + "newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a study form and submit object
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Upload an xml file.
    cy.get("div[role=button]").contains("Upload XML File").click()
    cy.fixture("study_test.xml").then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: "testFile.xml",
        mimeType: "text/xml",
        force: true,
      })
    })
    // Hacky way to get past RHF watch -method problem that doesn't allow cypress to get updated value for file
    cy.get("form").submit()

    // Saved objects list should have newly added item
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // // Navigate to summary and publish
    cy.get("button[type=button]").contains("Next").click()
    cy.get("button[type=button]").contains("Publish").click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
  })
})
