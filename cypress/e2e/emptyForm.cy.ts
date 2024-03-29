import { ObjectTypes } from "constants/wizardObject"

describe("empty form should not be alerted or saved", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    cy.generateSubmissionAndObjects()
    cy.contains("Edit").click({ force: true })

    cy.clickAccordionPanel("Describe")
  })

  it("should have Clear form button emptied the form", () => {
    // Check Clear form button in Sample object
    cy.clickAddObject(ObjectTypes.sample)

    cy.get("input[data-testid='title']").type("Test sample")
    cy.get("input[data-testid='sampleName.taxonId']").type("123")
    cy.optionsActions("Clear form")
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("input[data-testid='sampleName.taxonId']").should("have.value", "")

    // Check both Clear form button with Experiment object
    cy.clickAddObject(ObjectTypes.experiment)

    // Fill in the form an check if Clear form button can empty the form
    cy.get("input[data-testid='title']").type("Test experiment")
    cy.get("textarea[data-testid='description']").type("Test experiment description")
    cy.optionsActions("Clear form")
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")

    // Fill in the form again and save as draft
    cy.get("input[data-testid='title']").type("Test experiment")
    cy.get("textarea[data-testid='description']").type("Test experiment description")
    cy.formActions("Save as draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select the Experiment draft
    cy.wait(0)
    cy.continueLatestDraft(ObjectTypes.experiment)

    cy.get("input[data-testid='title']").should("have.value", "Test experiment")
    cy.get("textarea[data-testid='description']").should("have.value", "Test experiment description")

    // Click Clear form button and expect the form is empty
    cy.optionsActions("Clear form")
    cy.get("input[data-testid='title']").should("have.value", "")
    cy.get("textarea[data-testid='description']").should("have.value", "")

    // Select the Experiment draft again
    cy.continueLatestDraft(ObjectTypes.experiment)

    cy.get("input[data-testid='title']").should("have.value", "Test experiment")
    cy.get("textarea[data-testid='description']").should("have.value", "Test experiment description")
  })

  it("should not show draft saving alert when form is empty, should not save an empty form", () => {
    cy.clickAddObject(ObjectTypes.sample)
    cy.get("input[data-testid='title']").focus()

    // Switch to another object type form and Alert window should not pop up
    cy.editLatestSubmittedObject(ObjectTypes.experiment)
    // Switch back to Sample form and fill it
    cy.clickAddObject(ObjectTypes.sample)
    cy.get("[data-testid='title']").type("Test Sample title")
    cy.get("[data-testid='sampleName.taxonId']").type("123")

    // Clear form and Save
    cy.optionsActions("Clear form")
    cy.get("input[data-testid='title']", { timeout: 10000 }).should("be.empty")
    cy.formActions("Save as draft")

    // Expect Info window should pop up
    cy.get("div[role=alert]").contains("An empty form cannot be saved.").should("be.visible")

    // Fill in Form and Save
    cy.get("[data-testid='title']").type("Test Sample title")
    cy.get("input[data-testid='title']").should("have.value", "Test Sample title")

    cy.formActions("Save as draft")
    cy.wait(0)
    cy.get("div[role=alert]").contains("Draft saved with")

    // Clear Study title input and Save
    cy.get("input[data-testid='title']").clear()
    cy.formActions("Save as draft")

    // Expect Info window should pop up
    cy.get("div[role=alert]").contains("An empty form cannot be saved.").should("be.visible")
  })
})

export {}
