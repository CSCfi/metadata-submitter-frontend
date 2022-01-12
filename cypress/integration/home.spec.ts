describe("Home e2e", function () {
  beforeEach(() => {
    cy.login()
  })

  it("show Overview submissions in Home page, create a draft folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Overview submissions should have 2 different list and max. 5 items each list
    cy.contains("Your Draft Submissions", { timeout: 10000 }).should("be.visible")
    cy.contains("Your Published Submissions", { timeout: 10000 }).should("be.visible")

    cy.get("ul.MuiList-root")
      .its("length")
      .then($el => {
        if ($el > 0) {
          cy.get("ul.MuiList-root").eq(0).children().should("have.length.at.most", 5)
        }
      })

    // Create a new Unpublished folder
    cy.get("button").contains("Create Submission").click()

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
    cy.get("div", { timeout: 10000 }).contains("Logged in as:")

    cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()

    // Navigate to home & find folder
    cy.findDraftFolder("Test unpublished folder")

    cy.get('button[aria-label="Publish current folder"]').should("be.disabled")
    cy.get('button[aria-label="Edit current folder"]').contains("Edit").click()
    cy.get("[data-testid='folderName']").clear().type("Edited unpublished folder")
    cy.get("button[type=button]").contains("Next").click()
    cy.wait(500)

    // Navigate to home and delete object
    cy.findDraftFolder("Edited unpublished folder")

    cy.get("tr[data-testid='Test title']").within(() => cy.get('button[aria-label="Delete this object"]').click())
    cy.get("tr[data-testid='Test title']").should("not.exist")

    // Edit remaining object
    cy.get("tr[data-testid='Second test title']").within(() => cy.get('button[aria-label="Edit this object"]').click())
    cy.get("select[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 30000 }).should("have.length", 1)
    cy.wait(500)
    // Navigate to summary
    cy.get("button[type=button]").contains("Next", { timeout: 10000 }).click()

    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to home & edit submitted object
    cy.findDraftFolder("Edited unpublished folder")

    // Edit draft Sample form
    cy.get("tr[data-testid='Test sample']").within(() => cy.get('button[aria-label="Edit this object"]').click())
    cy.get("input[data-testid='title']").type(" edited")
    cy.get("button[type=button]").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    // Navigate to home & check updated draft's new title
    cy.findDraftFolder("Edited unpublished folder")
    cy.get("tr[data-testid='Test sample edited']").should("be.visible")

    cy.get("tr[data-testid='Second test title']").within(() => cy.get('button[aria-label="Edit this object"]').click())
    cy.get("input[data-testid='descriptor.studyTitle']").type(" edited")
    cy.get("button[type=button]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")

    //  Publish test folder from draft folders list
    cy.findDraftFolder("Edited unpublished folder")
    cy.get('button[aria-label="Publish current folder"]').click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').click()

    // Find published folder in corresponding list
    cy.get("button[data-testid='ViewAll-published']", { timeout: 10000 }).click()
    cy.get("body").then($body => {
      if ($body.find("div[aria-haspopup='listbox']").length > 0) {
        cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
        cy.get("ul").children().last().contains("All").click()
        cy.wait(500)
      }
    })

    cy.get("ul[data-testId='published-submissions']").within(() => {
      cy.get("div[role=button]").contains("Edited unpublished folder")
    })
  })

  it("create a published folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Create a new Published folder
    cy.get("button").contains("Create Submission").click()

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
    cy.wait(500)
    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to publish
    cy.get("button[type=button]").contains("Publish").click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()

    cy.get("div", { timeout: 10000 }).contains("Logged in as:")
  })
})

export {}
