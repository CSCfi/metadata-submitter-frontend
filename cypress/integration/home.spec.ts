import { ObjectTypes } from "constants/wizardObject"

describe("Home e2e", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("show draft submission data table in Home page, be able to edit and delete a draft submission inside the table", () => {
    cy.intercept("/submissions*").as("fetchSubmissions")

    // Check that there is projectId in home page
    cy.get("[data-testid='project-id-selection']").should("be.visible")
    cy.get("[data-testid='project-id-selection'] > div > input").invoke("val").should("not.be.empty")
    // Create a new Unpublished submission
    cy.get("button").contains("Create submission").click()

    // Add submission name & description, navigate to editing submission
    cy.newSubmission("Test unpublished submission")

    // Fill a Study form
    cy.clickAddObject(ObjectTypes.study)
    cy.get("input[data-testid='descriptor.studyTitle']").type("Test title")
    cy.get("select[data-testid='descriptor.studyType']").select("Resequencing")
    cy.get("[data-testid='descriptor.studyAbstract']").type("Test abstract")
    // Save draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Fill a Policy form draft
    cy.clickAddObject(ObjectTypes.policy)
    cy.get("[data-testid='title']").type("Test Policy title")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Save another draft for later use
    cy.formActions("New form")
    cy.get("input[data-testid='title']").type("Second test title")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Save submission and navigate to Home page
    cy.get("button[type=button]").contains("Save submission and exit").click()
    cy.get('button[aria-label="Save a new submission and move to frontpage"]').contains("Return to homepage").click()
    cy.wait("@fetchSubmissions", { timeout: 10000 })

    cy.contains("My submissions").should("be.visible")
    cy.get("[data-field='name']").eq(1).should("have.text", "Test unpublished submission")

    cy.get("[data-testid='edit-draft-submission']").scrollIntoView().should("be.visible")
    cy.contains("Edit").click({ force: true })

    cy.get("[data-testid='submissionName']", { timeout: 10000 }).clear().type("Edited unpublished submission")
    cy.get("button[type=submit]").contains("Save").click()
    cy.get("button[type=button]").contains("Save submission and exit").click()
    cy.get('button[aria-label="Save a new submission and move to frontpage"]').contains("Return to homepage").click()
    cy.wait("@fetchSubmissions", { timeout: 10000 })

    // Check that submission's name has been edited
    cy.contains("My submissions").should("be.visible").click()
    cy.contains("Edited unpublished submission").should("be.visible")

    // Delete the submission and it shouldn't be there anymore
    cy.get("[data-testid='delete-draft-submission']").scrollIntoView().should("be.visible")
    cy.contains("Delete").click({ force: true })

    cy.contains(".MuiAlert-message", "The submission has been deleted successfully!", {
      timeout: 1000,
    })
    cy.contains("Currently there are no submissions").should("be.visible")
  })

  it("create a published submission, not be able to edit or delete that submission inside the data table", () => {
    cy.generateSubmissionAndObjects()
    // Edit newly created submission
    cy.contains("Edit").click({ force: true })

    cy.clickAccordionPanel("publish")

    cy.get("button[role=button]", { timeout: 10000 }).contains("summary").click()

    // Fill and save DOI form
    cy.saveDoiForm()

    cy.get("button[data-testid='summary-publish']").contains("Publish").click()

    cy.get('[data-testid="confirm-publish-submission"]').contains("Publish").click()

    // Check that published submission exists in data table
    cy.contains("My submissions", { timeout: 10000 }).should("be.visible")
    cy.get("[data-testid='published-tab']").click()
    cy.get("[data-field='name']").eq(1).invoke("text").should("eq", "Test generated submission")

    // Check that Edit and Delete button do not appear in Published data table
    cy.get("[data-testid='edit-draft-submission']").should("not.exist")
    cy.get("[data-testid='delete-draft-submission']").should("not.exist")
  })
})

export {}
