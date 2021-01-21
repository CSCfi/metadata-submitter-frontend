describe("home test", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  beforeEach(() => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
  })

  it("show Overview submissions in Home page, create a draft folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Overview submissions should have 2 different list and max. 5 items each list
    cy.contains("Your Draft Submissions", { timeout: 10000 }).should("be.visible")
    cy.contains("Your Published Submissions").should("be.visible")

    cy.get("ul.MuiList-root").eq(0).children().should("have.length.at.most", 5)
    cy.get("ul.MuiList-root").eq(1).children().should("have.length.at.most", 5)

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

    // Navigate to publish
    cy.get("button[type=button]").contains("Save and Exit").click()
    cy.get('button[aria-label="Save a new folder and move to frontpage"]').contains("Return to homepage").click()

    // Click "See all" button to navigate to all unpublished folders list
    cy.get("div.MuiCardActions-root", { timeout: 30000 })
      .first()
      .should("be.visible")
      .find("button")
      .contains("See all")
      .should("be.visible")
      .then($btn => $btn.click())

    // Check the created folder existing in the list and navigate to see its details
    cy.get("ul.MuiList-root")
      .children()
      .last()
      .contains("Test unpublished folder", { timeout: 10000 })
      .should("be.visible")
      .then($el => $el.click())

    // Check the selected folder has the correct amount of objects
    cy.get("table", { timeout: 10000 }).should("be.visible")

    cy.get("tbody").should("be.visible")
    cy.get("tbody>tr").should("have.length", 1)

    // Delete an object inside the folder
    cy.get("button[aria-label='Delete this object']")
      .should("be.visible")
      .then($btn => $btn.click())
    cy.get("tbody>tr", { timeout: 10000 }).should("have.length", 0)

    // Navigate back to unpublished folders list
    cy.contains("Your draft submissions")
      .should("be.visible")
      .then($el => $el.click())

    // Close unpublished folders list
    cy.get("div.MuiCardActions-root")
      .contains("Close")
      .should("be.visible")
      .then($btn => $btn.click())

    // Check Overview submissions page is shown
    cy.contains("Your Draft Submissions").should("be.visible")
    cy.contains("Your Published Submissions").should("be.visible")
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

    // Click "See all" button to navigate to all published folders list
    cy.get("div.MuiCardActions-root", { timeout: 30000 })
      .last()
      .should("be.visible")
      .find("button")
      .contains("See all")
      .should("be.visible")
      .then($btn => $btn.click())

    // Check the created folder existing in the list and navigate to see its details
    cy.get("ul.MuiList-root")
      .children()
      .last()
      .contains("Test published folder")
      .should("be.visible")
      .then($el => $el.click())

    // Check the selected folder has the correct amount of objects
    cy.get("table", { timeout: 10000 }).should("be.visible")

    cy.get("tbody").should("be.visible")
    cy.get("tbody>tr").should("have.length", 1)

    // Navigate back to published folders list
    cy.contains("Your published submissions")
      .should("be.visible")
      .then($el => $el.click())

    // Close published folders list
    cy.get("div.MuiCardActions-root")
      .contains("Close")
      .should("be.visible")
      .then($btn => $btn.click())

    // Check Overview submissions page is shown
    cy.contains("Your Draft Submissions").should("be.visible")
    cy.contains("Your Published Submissions").should("be.visible")
  })
})
