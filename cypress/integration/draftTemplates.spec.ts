describe("draft selections and templates", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    // Generate folder and objects, navigate to publish step
    cy.generateFolderAndObjects()
    // Edit newly created folder
    cy.contains("Edit").click({ force: true })

    // Create a draft Policy object
    cy.clickAccordionPanel("Study, DAC and Policy")
    cy.clickAddObject("policy")
    cy.get("[data-testid=title]").type("Policy draft title")
    cy.formActions("Save as Draft")

    cy.clickAccordionPanel("publish")

    cy.get("button[role=button]", { timeout: 10000 }).contains("Publish").click()

    // Fill and save DOI form
    cy.saveDoiForm()

    cy.get("[data-testid='summary-publish']").click()
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

      cy.get("[role='heading']", { timeout: 10000 }).contains("Policy").should("be.visible")
      cy.get("[data-testid='title']").should("have.value", "Policy draft title")
    })
})

export {}
