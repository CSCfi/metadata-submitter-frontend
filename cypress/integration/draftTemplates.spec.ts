describe("draft selections and templates", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()

    // Fill a Study form
    cy.get("div[role=button]", { timeout: 10000 }).contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("[data-testid='descriptor.studyTitle']").type("Study test title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Study test title")
    cy.get("[data-testid='descriptor.studyType']").select("Metagenomics")

    // Submit Study form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Create another Study draft form
    cy.formActions("New form")
    cy.get("[data-testid='descriptor.studyTitle']").type("Study draft title")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.get("div[role=button]").contains("Study").click()

    // Create and Save another draft - Sample draft
    cy.clickFillForm("Sample")

    cy.get("[data-testid='title']").type("Sample draft title")
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='Draft-objects']").find("li").should("have.length", 1)

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
    cy.get("[data-schema='template-study']").contains("Study draft title").should("be.visible")
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

      cy.contains("Sample", { timeout: 10000 }).should("be.visible")
      cy.get("[data-testid='title']").should("have.value", "Sample draft title")
    }),
    it("should be able to select, edit and delete draft templates and reuse them when creating a new folder", () => {
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

      // Edit template
      cy.get("[data-testid='form-template-sample']").within(() => {
        cy.get("button").first().click()
      })

      cy.get("[data-testid='edit-template']").click()

      cy.get("[role='presentation']").within(() => {
        cy.get("form").should("be.visible")
        cy.contains("Update template").should("be.visible")
        cy.get("[data-testid='title']", { timeout: 10000 }).should("be.visible")
        cy.get("[data-testid='title']").type(" edit")
        cy.get("[data-testid='title']").should("have.value", "Sample draft title edit")

        cy.get("button[type='submit']").click()
      })

      cy.get("div[role=alert]", { timeout: 10000 }).contains("Template updated with")
      cy.contains("Template updated with").should("be.visible")

      // Re-query template item
      cy.get("[data-testid='template-sample-item']", { timeout: 10000 }).first().as("firstSampleTemplate")
      cy.get("@firstSampleTemplate").should("contain", "Sample draft title edit")

      /*
       Count sample templates, delete template and test that template count has decreased
      */
      // View "All" items if number of items >= 10
      cy.get("[data-testid='form-template-sample']").within($el => {
        if ($el.find("div[aria-haspopup='listbox']").length > 0) {
          cy.get("div[aria-haspopup='listbox']").contains(10).click()
        }
      })

      cy.get("body").then($body => {
        if ($body.find("li[role='option']").length > 0) {
          cy.get("li[role='option']").contains("All").click()
        }
      })

      // Delet the first item in the list
      cy.get("[data-testid='template-sample-item']")
        .its("length")
        .then($el => {
          cy.get("[data-testid='form-template-sample']").within(() => {
            // Vertical menu button
            cy.get("button").first().click()
          })
          cy.get("[data-testid='delete-template']", { timeout: 10000 })
            .should("be.visible")
            .then($button => $button.click())

          console.log("$el :>> ", $el)
          // Check the length of the items left
          const itemLength = $el - 1
          if ($el > 10) {
            cy.contains(`1-10 of ${itemLength} items`, { timeout: 10000 })
          }
          if ($el > 1 && $el <= 10) {
            cy.contains(`1-${itemLength} of ${itemLength} items`, { timeout: 10000 })
          }
        })

      cy.get("[data-testid='delete-template']").should("not.exist")
      // Select some drafts to reuse
      cy.get("[data-testid='form-template-study']", { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.get("label > span").should("be.visible")
          cy.get("label > span").first().click()
        })

      // Check that selected drafts exist
      cy.get("button", { timeout: 10000 }).contains("Create Submission").click()
      cy.get("[data-testid='toggle-user-drafts']", { timeout: 10000 }).click()
      cy.get("[data-testid='form-template-study']").within(() => {
        cy.get("input").first().should("be.checked")
      })

      // Create a new submission with selected drafts
      cy.newSubmission()

      // Check that selected templates exist in the folder
      cy.clickFillForm("Study")
      cy.get("[data-testid='Draft-objects']").children().should("have.length", 1)

      // Check if the draft can be used
      cy.get("[aria-label='Edit submission']").click()
      cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Study draft title")
      cy.get("[data-testid='descriptor.studyTitle']").type(" edited")
      cy.get("button[type=button]").contains("Update draft").click()

      // Check that the draft works normlly as its title should be updated
      cy.get("[aria-label='Edit submission']").click()
      cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Study draft title edited")

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

      cy.get("[data-testid='wizard-objects']", { timeout: 10000 }).should("be.visible")

      // Check that the new template is added as a draft
      cy.clickFillForm("Study")
      cy.get("[data-testid='Draft-objects']").children().should("have.length", 2)
    })
})

export {}
