describe("Draft operations", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()
  })

  it("should create new folder, save, delete and continue draft", () => {
    // Fill a Study form
    cy.clickFillForm("Study")
    cy.get("[data-testid='descriptor.studyTitle']").type("Test title")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='Draft-objects']").find("li").should("have.length", 1)

    // Save another draft
    cy.formActions("New form")
    cy.get("[data-testid='descriptor.studyTitle']").type("Test title 2")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Update draft, save from dialog
    cy.get("[data-testid='descriptor.studyTitle']").type(" second save")
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("h2").contains("Would you like to save draft version of this form")
    cy.get("div[role=dialog]").contains("Save").click()
    cy.get("[data-testid='Draft-objects']", { timeout: 10000 }).find("li").should("have.length", 2)

    // Delete a draft
    cy.get("[data-testid='Draft-objects']")
      .find("li")
      .first()
      .within(() => {
        cy.get("[data-testid='Delete submission']").first().click()
      })
    cy.get("[data-testid='Draft-objects']").find("li", { timeout: 60000 }).should("have.length", 1)

    // Continue draft
    cy.continueFirstDraft()

    cy.get("[data-testid='descriptor.studyTitle']")
    // Clear
    cy.formActions("Clear form")
    // Fill
    // cy.get("[data-testid='descriptor.studyTitle']").should("be.visible").focus()
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "")
    cy.get("[data-testid='descriptor.studyTitle']").type("New title")

    cy.get("[data-testid='descriptor.studyTitle']", { timeout: 10000 }).should("have.value", "New title")
    cy.get("[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=button]").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    // Create a new form and save as draft
    cy.formActions("New form")
    cy.get("[data-testid='descriptor.studyTitle']").should("contain.text", "")
    cy.get("[data-testid='descriptor.studyTitle']").type("New title 2")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "New title 2")
    cy.get("[data-testid='descriptor.studyType']").select("Resequencing")
    cy.formActions("Save as Draft")

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Check that there are 2 drafts saved in drafts list"
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Submit first form draft
    cy.continueFirstDraft()
    cy.formActions("Submit")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Submitted with")
    cy.get("[data-testid='Form-objects']").find("li").should("have.length", 1)

    // Submit second form draft
    cy.get("[data-testid='Draft-objects']").find("li").should("have.length", 1)

    cy.continueFirstDraft()
    cy.formActions("Submit")
    // Check that there are 2 submitted objects
    cy.get("[data-testid='Form-objects']", { timeout: 10000 }).find("li").should("have.length", 2)

    // Drafts list should be unmounted
    cy.get("[data-testid='Draft-objects']").should("not.exist")
  })
})

export {}
