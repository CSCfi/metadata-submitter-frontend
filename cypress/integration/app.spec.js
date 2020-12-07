describe("Basic e2e", function () {
  it("should navigate to home with click of login button", () => {
    cy.visit("http://localhost:3000/")
    cy.get('[alt="CSC Login"]').click()
  })

  it("should create new folder, add study form and publish folder", () => {
    cy.visit("http://localhost:3000/newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a study form and save object
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=submit]").contains("Save").click()

    // Upload an xml file. Need to wait for save. TODO: Better logic for waiting until last save is done
    cy.wait(2000).get("div[role=button]").contains("Upload XML File").click()
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