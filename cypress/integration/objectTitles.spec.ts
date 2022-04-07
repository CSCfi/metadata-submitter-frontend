describe("draft and submitted objects' titles", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
    cy.get("button", { timeout: 10000 }).contains("Create submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()
  })

  it("should show correct Submitted object's displayTitle", () => {
    // Focus on the Study title input in the Study form (not type anything)
    cy.clickFillForm("Sample")

    cy.get("[data-testid='title']").type("Sample test title").as("sampleTitle")
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    // Submit form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Check the submitted object has correct displayTitle
    cy.get("div[data-schema='sample']", { timeout: 10000 }).should("contain.text", "Sample test title")

    // Edit submitted object
    cy.get("button[type=button]").contains("Edit").click()

    cy.scrollTo("top")
    cy.contains("Update Sample", { timeout: 10000 }).should("be.visible")
    cy.get("@sampleTitle", { timeout: 10000 }).should("have.value", "Sample test title")
    cy.get("@sampleTitle", { timeout: 10000 }).type(" 2")

    cy.get("@sampleTitle", { timeout: 30000 }).should("have.value", "Sample test title 2")
    cy.get("button[type=submit]").contains("Update", { timeout: 10000 }).click()
    cy.get("div[role=alert]").contains("Object updated")

    // Check the submitted object has correctly updated displayTitle
    cy.get("div[data-schema='sample']", { timeout: 10000 }).should("contain.text", "Sample test title 2")

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    cy.get("h1", { timeout: 10000 }).contains("Summary").should("be.visible")
    // Check the submitted object has correct displayTitle
    cy.get("h6").contains("Sample").parent("div").children().eq(1).should("have.text", 1)
    cy.get("div[data-schema='sample']", { timeout: 10000 }).should("contain.text", "Sample test title 2")
  })

  it("should show correct Draft object's displayTitle", () => {
    // Focus on the Study title input in the Study form (not type anything)
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()

    // Fill a Study form and submit object
    cy.get("[data-testid='descriptor.studyTitle']").type("Draft title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Draft title")
    cy.get("select[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.get("[data-testid='descriptor.studyAbstract']").type("Draft abstract")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 1)

    // Check the draft object has correct displayTitle
    cy.get("div[data-schema='draft-study']", { timeout: 10000 }).should("contain.text", "Draft title")

    // Edit draft object's title
    cy.continueFirstDraft()
    cy.get("[data-testid='descriptor.studyTitle']").type(" 2")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Draft title 2")
    cy.get("button[type=button]").contains("Update draft").click()

    // Check the draft object has correctly updated displayTitle
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated")
    cy.get("ul[data-testid='Draft-objects']").within(() => {
      cy.get("div[data-schema='draft-study']", { timeout: 10000 }).should("contain.text", "Draft title 2")
    })
  })
})

export {}
