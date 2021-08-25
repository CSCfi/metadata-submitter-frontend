describe("Home e2e", function () {
  beforeEach(() => {
    cy.login()
  })

  it("show Overview submissions in Home page, create a draft folder, navigate to see folder details, delete object inside folder, navigate back to Overview submissions", () => {
    // Overview submissions should have 2 different list and max. 5 items each list
    cy.contains("Your Draft Submissions", { timeout: 10000 }).should("be.visible")
    cy.contains("Your Published Submissions", { timeout: 10000 }).should("be.visible")

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

    // Save draft
    cy.get("button[type=button]").contains("Save as Draft").click()

    // Save another draft for later use
    cy.get("button").contains("New form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Second test title")
    cy.get("button[type=button]").contains("Save as Draft").click()

    // Save folder and navigate to Home page
    cy.get("button[type=button]").contains("Save and Exit").click()
    cy.get('button[aria-label="Save a new folder and move to frontpage"]').contains("Return to homepage").click()
    cy.get("div", { timeout: 10000 }).contains("Logged in as:")

    cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()

    if (cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10)) {
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
      cy.get("ul").children().last().contains("All").click()
      cy.wait(500)
    }

    cy.get("ul[data-testid='draft-submissions']").within(() =>
      cy.get("div[role=button]").last().contains("Test unpublished folder").last().click()
    )

    cy.get('button[aria-label="Publish current folder"]').should("be.disabled")
    cy.get('button[aria-label="Edit current folder"]').contains("Edit").click()
    cy.get("input[name='name']").clear().type("Edited unpublished folder")
    cy.get("button[type=button]").contains("Next").click()

    // Navigate to home and delete object
    cy.get('a[aria-label="go to frontpage"]').click()
    cy.get("div", { timeout: 10000 }).contains("Logged in as:")
    cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()
    if (cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10)) {
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
      cy.get("ul").children().last().contains("All").click()
      cy.wait(500)
    }
    cy.get("ul[data-testid='draft-submissions']").within(() =>
      cy.get("div[role=button]").last().contains("Edited unpublished folder").last().click()
    )

    cy.get("tr[data-testid='Test title']").within(() => cy.get('button[aria-label="Delete this object"]').click())
    cy.get("tr[data-testid='Test title']").should("not.exist")

    // Edit remaining object
    cy.get("tr[data-testid='Second test title']").within(() => cy.get('button[aria-label="Edit this object"]').click())
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 30000 }).should("have.length", 2)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next", { timeout: 10000 }).click()

    // Check the amount of submitted objects in Study
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to home and publish test folder from draft folders list
    cy.get('a[aria-label="go to frontpage"]').click()
    // cy.get("div[role=button]").contains("Edited unpublished folder").click()
    cy.get("button[data-testid='ViewAll-draft']", { timeout: 10000 }).click()
    if (cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10)) {
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
      cy.get("ul").children().last().contains("All").click()
      cy.wait(500)
    }
    cy.get("ul[data-testid='draft-submissions']").within(() =>
      cy.get("div[role=button]").last().contains("Edited unpublished folder").last().click()
    )
    cy.get('button[aria-label="Publish current folder"]').click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').click()

    // Find published folder in corresponding list
    cy.get("button[data-testid='ViewAll-published']", { timeout: 10000 }).click()
    if (cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10)) {
      cy.get("div[aria-haspopup='listbox']", { timeout: 10000 }).contains(10).click()
      cy.get("ul").children().last().contains("All").click()
      cy.wait(500)
    }
    cy.get("ul[data-testId='published-submissions']").within(() => {
      cy.get("div[role=button]").contains("Edited unpublished folder")
    })
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
