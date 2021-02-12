describe("empty form should not be alerted or saved", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should not show draft saving alert when form is empty, should not save an empty form", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.visit(baseUrl + "newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

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
