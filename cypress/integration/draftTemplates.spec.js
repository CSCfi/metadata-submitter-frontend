describe("draft selections and templates", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should show the list of drafts before folder is published", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.visit(baseUrl + "newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Study test title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Study test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Submit Study form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Create another Study draft form
    cy.get("button").contains("New form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Study draft title")

    // Save a draft
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Create and Save another draft - Sample draft
    cy.get("div[role=button]").contains("Sample").click()
    cy.get("div[role=button]", { timeout: 10000 })
      .contains("Fill Form")
      .should("be.visible")
      .then($btn => $btn.click())

    cy.get("input[name='title']").type("Sample draft title ")
    cy.get("input[name='sampleName.taxonId']").type(123)
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Navigate to publish button at the bottom
    cy.get("button[type=button]").contains("Publish").click()

    // Select drafts inside the dialog
    cy.get("form").within(() => {
      cy.get("input[type='checkbox']").first().check()
      cy.get("input[type='checkbox']").last().check()

      // Publish folder
      cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
    })

    // Navigate back to home page
    cy.get("div", { timeout: 10000 }).contains("Logged in as:")
  })
})
