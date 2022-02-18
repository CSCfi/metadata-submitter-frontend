describe("draft selections and templates", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()

    // Fill a Study form
    cy.get("div[role=button]", { timeout: 10000 }).contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("[data-testid='descriptor.studyTitle']").type("Study test title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Study test title")
    cy.get("[data-testid='descriptor.studyType']").select("Metagenomics")

    // Submit Study form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Create another Study draft form
    cy.formActions("New form")
    cy.get("[data-testid='descriptor.studyTitle']").type("Study draft title")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.get("div[role=button]").contains("Study").click()

    // Create and Save another draft - Sample draft
    cy.clickFillForm("Sample")

    cy.get("[data-testid='title']").type("Sample draft title")
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='Draft-objects']").find("li").should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Navigate to publish button at the bottom
    cy.get("button[type=button]").contains("Publish").click()
    cy.get("[data-testid='alert-dialog-content']").should(
      "have.text",
      "Objects in this folder will be published. Please choose the drafts you would like to save, unsaved drafts will be removed from this folder."
    )
  })
  it("should show the list of drafts before folder is published, and show saved drafts in Home page", () => {
    // Select drafts inside the dialog
    cy.get("form").within(() => {
      cy.get("input[type='checkbox']").first().check()
      cy.get("input[type='checkbox']").last().check()

      // Publish folder
      cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
    })

    // Navigate back to home page
    cy.get("h4", { timeout: 10000 }).contains("My submissions")
  }),
    it("should open the correct draft when clicking View button", () => {
      // Select drafts inside the dialog
      cy.get("form").within(() => {
        cy.get("button[aria-label='View draft']").last().click()
      })

      cy.contains("Sample", { timeout: 10000 }).should("be.visible")
      cy.get("[data-testid='title']").should("have.value", "Sample draft title")
    })
})

export {}
