describe("Home e2e", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("show draft submission data table in Home page, be able to edit and delete a draft submission inside the table", () => {
    cy.intercept("/folders*").as("fetchFolders")

    // Check that there is projectId in home page
    cy.get("[data-testid='project-id-selection']").should("be.visible")
    cy.get("[data-testid='project-id-selection'] > div > input").invoke("val").should("not.be.empty")
    // Create a new Unpublished folder
    cy.get("button").contains("Create submission").click()

    // Add folder name & description, navigate to editing folder
    cy.newSubmission("Test unpublished folder")

    // Fill a Study form
    cy.clickFillForm("Study")
    cy.get("input[data-testid='descriptor.studyTitle']").type("Test title")
    cy.get("select[data-testid='descriptor.studyType']").select("Resequencing")

    // Save draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Save another draft for later use
    cy.formActions("New form")
    cy.get("input[data-testid='descriptor.studyTitle']").type("Second test title")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Fill a Sample form draft
    cy.clickFillForm("Sample")
    cy.get("input[data-testid='title']").type("Test sample")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Save folder and navigate to Home page
    cy.get("button[type=button]").contains("Save and Exit").click()
    cy.get('button[aria-label="Save a new folder and move to frontpage"]').contains("Return to homepage").click()
    cy.wait("@fetchFolders", { timeout: 10000 })

    cy.contains("My submissions").should("be.visible")
    cy.get("[data-field='name']").eq(1).should("have.text", "Test unpublished folder")

    cy.get("[data-testid='edit-draft-submission']").scrollIntoView().should("be.visible")
    cy.contains("Edit").click({ force: true })

    cy.get("[data-testid='folderName']", { timeout: 10000 }).clear().type("Edited unpublished folder")
    cy.get("button[type=button]").contains("Next").click()
    cy.get("[data-testid='wizard-objects']", { timeout: 10000 }).should("be.visible")
    cy.get("button[type=button]").contains("Save and Exit").click()
    cy.get('button[aria-label="Save a new folder and move to frontpage"]').contains("Return to homepage").click()
    cy.wait("@fetchFolders", { timeout: 10000 })

    // Check that submission's name has been edited
    cy.contains("My submissions").should("be.visible").click()
    cy.contains("Edited unpublished folder").should("be.visible")

    // Delete the submission and it shouldn't be there anymore
    cy.get("[data-testid='delete-draft-submission']").scrollIntoView().should("be.visible")
    cy.contains("Delete").click({ force: true })

    cy.contains(".MuiAlert-message", "The submission has been deleted successfully!", {
      timeout: 1000,
    })
    cy.contains("Currently there are no submissions").should("be.visible")
  })

  it("create a published submission, not be able to edit or delete that submission inside the data table", () => {
    // Create a new Published folder
    cy.get("button").contains("Create submission").click()

    // Add folder name & description, navigate to editing folder
    cy.newSubmission()
    // Fill a Study form
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[data-testid='descriptor.studyTitle']").type("Test title")
    cy.get("select[data-testid='descriptor.studyType']").select("Resequencing")

    // Submit form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()
    cy.get("h1", { timeout: 10000 }).contains("Summary").should("be.visible")
    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to publish
    cy.get("button[type=button]").contains("Publish").click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()

    // Check that published submission exists in data table
    cy.contains("My submissions", { timeout: 1000 }).should("be.visible")
    cy.get("[data-testid='published-tab']").click()
    cy.get("[data-field='name']").eq(1).invoke("text").should("eq", "Test name")

    // Check that Edit and Delete button do not appear in Published data table
    cy.get("[data-testid='edit-draft-submission']").should("not.exist")
    cy.get("[data-testid='delete-draft-submission']").should("not.exist")
  })
})

export {}
