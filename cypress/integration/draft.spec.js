describe("Draft operations", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()
    // Navigate to folder creation
    cy.get("button[type=button]", { timeout: 10000 }).contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
  })

  it("should create new folder, save, delete and continue draft", () => {
    // Fill a Study form
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")

    // Save a draft
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 1)

    // Save another draft
    cy.get("button[type=button]").contains("New form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title 2")
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Update draft, save from dialog
    cy.get("input[name='descriptor.studyTitle']").type(" second save")
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("h2").contains("Would you like to save draft version of this form")
    cy.get("div[role=dialog]").contains("Save").click()
    cy.wait(500)
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Delete a draft
    cy.get("ul[data-testid='Draft-objects']")
      .find("li")
      .first()
      .within(() => {
        cy.get("button[aria-label='Delete submission']").first().click()
      })
    cy.get("ul[data-testid='Draft-objects']").find("li", { timeout: 60000 }).should("have.length", 1)

    // Continue draft
    // Clear
    cy.continueFirstDraft()
    cy.get("input[name='descriptor.studyTitle']")
    cy.get("button[type=button]", { timeout: 10000 }).contains("Clear form").click()

    // Fill
    cy.get("input[name='descriptor.studyTitle']").type("New title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=button]").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    // Create a new form and save as draft
    cy.get("button", { timeout: 10000 }).contains("New form").click({ force: true })
    cy.get("input[name='descriptor.studyTitle']").should("contain.text", "")
    cy.get("input[name='descriptor.studyTitle']").type("New title 2")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title 2")
    cy.get("select[name='descriptor.studyType']").select("Resequencing")
    cy.get("button[type=button]").contains("Save as Draft").click()

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Check that there are 2 drafts saved in drafts list"
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Submit first form draft
    cy.continueFirstDraft()
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Submitted with")
    cy.get("ul[data-testid='Form-objects']").find("li").should("have.length", 1)

    // Submit second form draft
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 1)
    cy.continueFirstDraft()
    cy.get("button[type=submit]").contains("Submit").click()

    // Check that there are 2 submitted objects
    cy.get("ul[data-testid='Form-objects']", { timeout: 10000 }).find("li").should("have.length", 2)

    // Drafts list should be unmounted
    cy.get("ul[data-testid='Draft-objects']").should("not.exist")
  })
})
