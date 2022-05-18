import { ObjectTypes } from "constants/wizardObject"

describe("draft and submitted objects' titles", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("should show correct Submitted object's displayTitle", () => {
    cy.get("button", { timeout: 10000 }).contains("Create submission").click()
    // Add submission name & description, navigate to submissions
    cy.newSubmission()
    // Variables
    cy.get("[data-testid='descriptor.studyTitle']").as("studyTitle")

    // Fill a Study form and submit object
    cy.get("@studyTitle").type("Test title")
    cy.get("@studyTitle").should("have.value", "Test title")
    cy.get("select[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.get("[data-testid='descriptor.studyAbstract']").type("New abstract")

    // Submit form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Check the submitted object has correct displayTitle
    cy.get("[data-testid='study-objects-list']").within(() => {
      cy.get("a").contains("Test title")
    })

    // Edit submitted object
    cy.editLatestSubmittedObject(ObjectTypes.study)

    cy.scrollTo("top")
    cy.contains("Update Study", { timeout: 10000 }).should("be.visible")
    cy.get("@studyTitle", { timeout: 10000 }).should("have.value", "Test title")
    cy.get("@studyTitle", { timeout: 10000 }).type(" 2")

    cy.get("@studyTitle", { timeout: 30000 }).should("have.value", "Test title 2")
    cy.get("button[type=submit]").contains("Update", { timeout: 10000 }).click()
    cy.get("div[role=alert]").contains("Object updated")

    // Check the submitted object has correctly updated displayTitle
    cy.get("[data-testid='study-objects-list']").within(() => {
      cy.get("a").contains("Test title 2")
    })
  })

  it("should show correct Draft object's displayTitle", () => {
    cy.generateSubmissionAndObjects(ObjectTypes.policy)
    cy.contains("Edit").click({ force: true })

    cy.clickAccordionPanel("Describe")

    // Fill Sample form and save as draft
    cy.clickAddObject(ObjectTypes.sample)

    cy.get("input[data-testid='title']").type("Draft title")
    cy.get("input[data-testid='sampleName.taxonId']").type("123")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='sample-objects-list']").find("li").should("have.length", 1)

    // Check the draft object has correct displayTitle
    cy.get("[data-testid='sample-objects-list']").within(() => {
      cy.get("a").contains("Draft title").click()
    })

    // Edit draft object's title
    cy.continueLatestDraft(ObjectTypes.sample)
    cy.get("[data-testid='title']").type(" 2")
    cy.get("[data-testid='title']").should("have.value", "Draft title 2")
    cy.get("button[type=button]").contains("Update draft").click()

    // Check the draft object has correctly updated displayTitle
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated")
    cy.get("[data-testid='sample-objects-list']").within(() => {
      cy.get("a").contains("Draft title 2").click()
    })
  })
})

export {}
