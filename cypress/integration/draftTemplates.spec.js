describe("draft selections and templates", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form
    cy.wait(500)
    cy.get("div[role=button]", { timeout: 10000 }).contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Study test title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Study test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Submit Study form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Create another Study draft form
    cy.get("button").contains("New form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Study draft title")

    // Save a draft
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.get("div[role=button]").contains("Study").click()

    // Create and Save another draft - Sample draft
    cy.get("div[role=button]").contains("Sample", { timeout: 10000 }).click()
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

    cy.get("input[name='title']").type("Sample draft title")
    cy.get("input[name='sampleName.taxonId']").type(123)
    cy.get("button[type=button]").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Navigate to publish button at the bottom
    cy.get("button[type=button]").contains("Publish").click()
    cy.get("[data-testid='alert-dialog-content']").should(
      "have.text",
      "Objects in this folder will be published. Please choose the drafts you would like to save, unsaved drafts will be removed from this folder."
    )
  })
  it("should show the list of drafts before folder is published, and show saved drafts in Home page", () => {
    // Select drafts inside the dialog
    cy.get("form").within(() => {
      cy.get("input[type='checkbox']").first().check()
      cy.get("input[type='checkbox']").last().check()

      // Publish folder
      cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
    })

    // Navigate back to home page
    cy.get("div", { timeout: 10000 }).contains("Logged in as:")

    // Check if the drafts have been saved as user's templates in Home page
    cy.contains("Your Draft Templates", { timeout: 10000 }).should("be.visible")
    // Check saved Study draft
    cy.get("h6").contains("Template-study").as("studyObject")
    cy.get("@studyObject")
      .should("be.visible")
      .then($el => $el.click())
    cy.get("div[data-schema='template-study']").contains("Study draft title").should("be.visible")
    // Check saved Sample draft
    cy.get("h6").contains("Template-sample").as("sampleObject")
    cy.get("@sampleObject")
      .should("be.visible")
      .then($el => $el.click())
    cy.get("div[data-schema='template-sample']").contains("Sample draft title").should("be.visible")
  }),
    it("should open the correct draft when clicking View button", () => {
      // Select drafts inside the dialog
      cy.get("form").within(() => {
        cy.get("button[aria-label='View draft']").last().click()
      })
      cy.get("h1", { timeout: 10000 }).contains("Sample").should("be.visible")
      cy.get("[data-testid='title']").should("have.value", "Sample draft title")
    }),
    it("should be able to select draft templates and reuse them when creating a new folder", () => {
      // Select drafts inside the dialog
      cy.get("form").within(() => {
        cy.get("input[type='checkbox']").first().check()
        cy.get("input[type='checkbox']").last().check()

        // Publish folder
        cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
      })
      // Navigate back to home page
      cy.get("div", { timeout: 10000 }).contains("Logged in as:")
      // Check if the drafts have been saved as user's templates in Home page
      cy.contains("Your Draft Templates", { timeout: 10000 }).should("be.visible")

      // Select some drafts to reuse
      cy.get("[data-testid='form-template-study']").within(() => {
        cy.get("input").first().check()
      })

      cy.get("[data-testid='form-template-sample']").within(() => {
        cy.get("input").first().click()
      })

      // Check that selected drafts exist
      cy.get("button", { timeout: 10000 }).contains("Create Submission").click()
      cy.get("[data-testid='toggle-user-drafts']", { timeout: 10000 }).click()
      cy.get("[data-testid='form-template-study']").within(() => {
        cy.get("input").first().should("be.checked")
      })
      cy.get("[data-testid='form-template-sample']").within(() => {
        cy.get("input").first().should("be.checked")
      })

      // Create a new submission with selected drafts
      cy.get("input[name='name']").type("Test name")
      cy.get("textarea[name='description']").type("Test description")
      cy.get("button[type=button]").contains("Next").click()

      cy.wait(500)

      // Check that selected templates exist in the folder
      cy.clickFillForm("Study")
      cy.get("[data-testid='Draft-objects']").children().should("have.length", 1)

      cy.clickFillForm("Sample")
      cy.get("[data-testid='Draft-objects']").children().should("have.length", 1)

      // Check if the draft can be used
      cy.get("[aria-label='Edit submission']").click()
      cy.get("[data-testid='title']").should("have.value", "Sample draft title")
      cy.get("[data-testid='title']").type(" edited")
      cy.get("button[type=button]").contains("Update draft").click()

      // Check that the draft works normlly as its title should be updated
      cy.get("[aria-label='Edit submission']").click()
      cy.get("[data-testid='title']").should("have.value", "Sample draft title edited")

      // Check that editing a draft folder with adding a new template also works
      // Navigate to home & find folder
      cy.findDraftFolder("Test name")
      cy.get('button[aria-label="Edit current folder"]').contains("Edit").click()

      // Select a new Study template
      cy.get("[data-testid='toggle-user-drafts']", { timeout: 10000 }).click()
      cy.get("[data-testid='form-template-study']").within(() => {
        cy.get("input").first().check()
      })
      cy.get("button[type=button]").contains("Next").click()

      cy.wait(500)
      // Check that the new template is added as a draft
      cy.clickFillForm("Study")
      cy.get("[data-testid='Draft-objects']").children().should("have.length", 2)
    })
})
