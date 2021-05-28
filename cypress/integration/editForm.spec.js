describe("Form edit functions", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  beforeEach(() => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.wait(1000)
    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()
    // Navigate to folder creation
    cy.get("button[type=button]", { timeout: 10000 }).contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
  })

  it("should submit Sample form and display all form values when editing the form", () => {
    // Fill a Sample form and submit object
    cy.get("div[role=button]").contains("Sample").click()
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

    cy.get("input[name='title']").type("Sample test title")
    cy.get("input[name='sampleName.taxonId']").type("123456")
    cy.get("select[name='sampleData']").select("Human Sample")
    cy.get("select[name='sampleData.gender']").select("unknown")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Clear form
    cy.get("button[type=button]").contains("Clear").click()

    // Edit saved submission
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='title']").should("have.value", "Sample test title")
    cy.get("input[name='title']", { timeout: 10000 }).focus().type(" edited").blur()
    cy.get("input[name='title']").should("have.value", "Sample test title edited")
    cy.get("input[name='sampleName.taxonId']").should("have.value", "123456")
    cy.get("select[name='sampleData']").should("have.value", "Human Sample")
    cy.get("select[name='sampleData.gender']").should("have.value", "unknown")
    // Change Sample Data Type
    cy.get("select[name='sampleData']").select("Non Human Sample")
    cy.get("input[name='sampleData.dataDescription']").type("Sample Type Description")
    // Update
    cy.get("button[type=button]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")

    // Clear object in state
    cy.get("button[type=button]").contains("New form").click()

    // Test updated form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='title']").should("have.value", "Sample test title edited")
    cy.get("input[name='sampleData.dataDescription']").should("have.value", "Sample Type Description")
  })

  it("should render Experiment form correctly when editing", () => {
    // Fill an Experiment form
    cy.get("div[role=button]").contains("Experiment").click()
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

    const title = "Test experiment"
    const description = "Test experiment description"
    const designDescription = "Test design description"
    const sampleReference = "Individual Sample"
    const individualSampleLabel = "Individual Sample test label"

    cy.get("input[data-testid='title']").type(title)
    cy.get("textarea[data-testid='description']").type(description)
    cy.get("textarea[name='design.designDescription']").type(designDescription)
    cy.get("select[name='design.sampleDescriptor']").select(sampleReference)
    cy.get("input[data-testid='design.sampleDescriptor.label']").type(individualSampleLabel)

    // Save Experiment form
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select the Experiment draft
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Choose from drafts", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("input[data-testid='title']").should("have.value", title)
    cy.get("textarea[data-testid='description']").should("have.value", description)
    cy.get("textarea[name='design.designDescription']").should("have.value", designDescription)
    cy.get("select[name='design.sampleDescriptor']").should("have.value", sampleReference)
    cy.get("input[data-testid='design.sampleDescriptor.label']").should("have.value", individualSampleLabel)
  })

  it("should render form with checkboxes correctly", () => {
    // Fill an Dataset form
    cy.get("div[role=button]").contains("Dataset").click()
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

    const title = "Test Dataset"

    cy.get("input[data-testid='title']").type(title)
    cy.get("[type='checkbox']").first().check()

    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select newly saved draft
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Choose from drafts", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )

    cy.get("button[aria-label='Continue draft']").first().click()
    cy.get("[type='checkbox']").first().should("be.checked")

    // Test that checkbox clears with form clear -button
    cy.get("button[type=button]", { timeout: 10000 }).contains("Clear form").click()
    cy.get("[type='checkbox']").first().should("not.be.checked")
  })
})
