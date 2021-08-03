describe("Home e2e", function () {
  beforeEach(() => {
    cy.login()
  })

  it("show Overview submissions in Home page, create a draft folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Overview submissions should have 2 different list and max. 5 items each list
    cy.contains("Your Draft Submissions", { timeout: 10000 }).should("be.visible")
    cy.contains("Your Published Submissions").should("be.visible")

    cy.get("ul.MuiList-root").eq(0).children().should("have.length.at.most", 5)

    // Create a new Unpublished folder
    cy.get("button").contains("Create Submission").click()

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to editing folder
    cy.get("input[name='name']").type("Test unpublished folder")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form
    cy.get("div[role=button]", { timeout: 10000 }).contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("select[name='descriptor.studyType']").select("Resequencing")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Save folder and navigate to Home page
    cy.get("button[type=button]").contains("Save and Exit").click()
    cy.get('button[aria-label="Save a new folder and move to frontpage"]').contains("Return to homepage").click()
  })

  it("create a published folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Create a new Published folder
    cy.get("button").contains("Create Submission").click()

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to editing folder
    cy.get("input[name='name']").type("Test published folder")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("select[name='descriptor.studyType']").select("Resequencing")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to publish
    cy.get("button[type=button]").contains("Publish").click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()

    cy.get("div", { timeout: 10000 }).contains("Logged in as:")
  })
})
