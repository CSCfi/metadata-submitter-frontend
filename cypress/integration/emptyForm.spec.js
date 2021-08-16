describe("empty form should not be alerted or saved", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
  })

  it("should have New form button and Clear form button emptied the form", () => {
    // Check Clear form button in Sample object
    cy.clickFillForm("Sample")

    cy.get("input[data-testid='title']").type("Test sample")
    cy.get("input[data-testid='sampleName.taxonId']").type(123)
    cy.get("button[type='button']").contains("Clear form").click()
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("input[data-testid='sampleName.taxonId']").should("have.value", "")

    // Check both New form button and Clear form button with Experiment object
    cy.clickFillForm("Experiment")

    // Check if New form button can empty the form
    cy.get("form")
    cy.get("button[type='button']", { timeout: 10000 }).contains("New form").click()
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")

    // Fill in the form an check if Clear form button can empty the form
    cy.get("input[data-testid='title']").type("Test experiment")
    cy.get("textarea[data-testid='description']").type("Test experiment description")
    cy.get("button[type='button']").contains("Clear form").click()
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")

    // Fill in the form again and save as draft
    cy.get("input[data-testid='title']").type("Test experiment")
    cy.get("textarea[data-testid='description']").type("Test experiment description")
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select the Experiment draft
    cy.continueFirstDraft()

    cy.get("input[data-testid='title']").should("have.value", "Test experiment")
    cy.get("textarea[data-testid='description']").should("have.value", "Test experiment description")

    // Click Clear form button and expect the form is empty
    cy.get("button[type='button']").contains("Clear form").click()
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")

    // Select the Experiment draft again
    cy.continueFirstDraft()

    cy.get("input[data-testid='title']").should("have.value", "Test experiment")
    cy.get("textarea[data-testid='description']").should("have.value", "Test experiment description")

    // Click New form button and expect the form is empty
    cy.get("button[type='button']").contains("New form").click()
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")
  })

  it("should not show draft saving alert when form is empty, should not save an empty form", () => {
    // Focus on the Study title input in the Study form (not type anything)
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").focus()

    // Switch to "Upload XML File" and Alert window should not pop up
    cy.get("div[role=button]").contains("Upload XML File").click()
    cy.get("form", { timeout: 10000 }).should("be.visible")
    cy.get("form").within(() => {
      cy.get("input[placeholder='Name']").should("be.visible")
    })

    // Switch back to "Fill form" and fill it
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test study")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test study")

    // Clear form and Save
    cy.get("button[type=button]").contains("Clear form").click()
    cy.get("input[name='descriptor.studyTitle']", { timeout: 10000 }).should("be.empty")
    cy.get("button[type=button]").contains("Save as Draft").click()

    // Expect Info window should pop up
    cy.get("div[role=alert]", { timeout: 10000 }).contains("An empty form cannot be saved.").should("be.visible")

    // Fill in Form and Save
    cy.get("input[name='descriptor.studyTitle']").type("Test study")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test study")
    cy.get("button[type=button]").contains("Save as Draft").click()

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Clear Study title input and Save
    cy.get("input[name='descriptor.studyTitle']").clear()
    cy.get("button[type=button]").contains("Save as Draft").click()

    // Expect Info window should pop up
    cy.get("div[role=alert]", { timeout: 10000 }).contains("An empty form cannot be saved.").should("be.visible")
  })
})
