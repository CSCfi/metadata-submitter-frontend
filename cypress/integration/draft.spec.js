describe("Draft operations", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  beforeEach(() => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.wait(1000)
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
    cy.get("div[role=button]").contains("Choose from drafts").click()
    cy.get("div[data-testid=Existing").find("li").should("have.length", 1)

    // Save another draft
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title 2")
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Update draft, save from dialog
    cy.get("input[name='descriptor.studyTitle']").type(" second save")
    cy.get("div[role=button]").contains("Choose from drafts").click()
    cy.get("h2").contains("Would you like to save draft version of this form")
    cy.get("div[role=dialog]").contains("Save").click()
    cy.get("div[data-testid='Existing']").find("li").should("have.length", 2)

    // Delete a draft
    cy.get("button[aria-label='Delete draft']").first().click()
    cy.get("div[data-testid='Existing']").find("li", { timeout: 60000 }).should("have.length", 1)

    // Continue draft
    // Clear
    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("input[name='descriptor.studyTitle']")
    cy.get("button[type=button]", { timeout: 10000 }).contains("Clear form").click()

    // Fill
    cy.get("input[name='descriptor.studyTitle']").type("New title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=button]").contains("Update draft").click()

    // Create a new form and save as draft
    cy.get("button", { timeout: 10000 }).contains("New form").click({ force: true })
    cy.get("input[name='descriptor.studyTitle']").should("contain.text", "")
    cy.get("input[name='descriptor.studyTitle']").type("New title 2")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title 2")
    cy.get("select[name='descriptor.studyType']").select("Resequencing")
    cy.get("button[type=button]").contains("Save as Draft").click()

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Check that there are 2 drafts saved in "Choose from drafts"
    cy.get("div[role=button]").contains("Choose from drafts").click()
    cy.get("div[data-testid='Existing']").find("li").should("have.length", 2)

    // Submit first form draft
    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Submit second form draft
    cy.get("div[role=button]").contains("Choose from drafts").click()
    cy.get("div[data-testid='Existing']").find("li").should("have.length", 1)
    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("button[type=submit]").contains("Submit").click()

    // Check that there are 2 submitted objects
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Drafts should be empty
    cy.get("div[role=button]").contains("Choose from drafts").click()
    cy.get("div").contains("No study drafts.")
  })

  it("should render Experiment form correctly when editing", () => {
    // Fill an Experiment form
    cy.get("div[role=button]").contains("Experiment").click()
    cy.wait(500)
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("input[data-testid='title']").type("Test experiment")
    cy.get("textarea[data-testid='description']").type("Test experiment description")
    cy.get("textarea[name='design.designDescription']").type("Test design description")

    // Save Experiment form
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select the Experiment draft
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Choose from drafts", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("input[data-testid='title']").should("have.value", "Test experiment")
    cy.get("textarea[data-testid='description']").should("have.value", "Test experiment description")
    cy.get("textarea[name='design.designDescription']").should("have.value", "Test design description")
  })
})
