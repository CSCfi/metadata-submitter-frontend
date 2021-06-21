describe("Populate form and render form elements by object data", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()
    // Navigate to folder creation
    cy.get("button[type=button]", { timeout: 10000 }).contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
  })

  it("should submit Sample form and display all form values when editing the form", () => {
    const testData = {
      title: "Sample test title",
      taxonId: "123456",
      sampleData: "Human Sample",
      gender: "unknown",
    }

    cy.clickFillForm("Sample")

    cy.get("input[name='title']").type(testData.title)
    cy.get("input[name='sampleName.taxonId']").type(testData.taxonId)
    cy.get("select[name='sampleData']").select(testData.sampleData)
    cy.get("select[name='sampleData.gender']").select(testData.gender)

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Clear form
    cy.get("button[type=button]").contains("Clear").click()

    // Edit saved submission
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='title']").should("have.value", testData.title)
    cy.get("input[name='title']", { timeout: 10000 }).focus().type(" edited").blur()
    cy.get("input[name='title']").should("have.value", `${testData.title} edited`)
    cy.get("input[name='sampleName.taxonId']").should("have.value", testData.taxonId)
    cy.get("select[name='sampleData']").should("have.value", testData.sampleData)
    cy.get("select[name='sampleData.gender']").should("have.value", testData.gender)
    cy.get("button[type=button]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")

    // Clear object in state
    cy.get("button[type=button]").contains("New form").click()

    // Test updated title
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='title']").should("have.value", `${testData.title} edited`)
  })

  it("should render Experiment form correctly when editing", () => {
    const testData = {
      title: "Test experiment",
      description: "Test experiment description",
      designDescription: "Test design description",
      sampleReference: "Individual Sample",
      individualSampleLabel: "Individual Sample test label",
      singleProcessing: "Single Processing",
      singleProcessingLabel: "Single Processing label",
    }

    cy.clickFillForm("Experiment")

    cy.get("input[data-testid='title']").type(testData.title)
    cy.get("textarea[data-testid='description']").type(testData.description)
    cy.get("textarea[name='design.designDescription']").type(testData.designDescription)
    cy.get("select[name='design.sampleDescriptor']").select(testData.sampleReference)
    cy.get("input[data-testid='design.sampleDescriptor.label']").type(testData.individualSampleLabel)
    // Expected Base Call Table
    cy.get("div").contains("Expected Base Call Table").parent().children("button").click()
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].baseCall']").type("Test base call")
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].readGroupTag']").type(
      "Test read group tag"
    )
    cy.get("select[name='processing']").select(testData.singleProcessing)
    cy.get("input[data-testid='processing']").type(testData.singleProcessingLabel)

    // Save Experiment form
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.chooseFromDrafts()
    cy.get("button[aria-label='Continue draft']").first().click()

    cy.get("input[data-testid='title']").should("have.value", testData.title)
    cy.get("textarea[data-testid='description']").should("have.value", testData.description)
    cy.get("textarea[name='design.designDescription']").should("have.value", testData.designDescription)
    cy.get("select[name='design.sampleDescriptor']").should("have.value", testData.sampleReference)
    cy.get("input[data-testid='design.sampleDescriptor.label']").should("have.value", testData.individualSampleLabel)
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].baseCall']").should(
      "have.value",
      "Test base call"
    )
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].readGroupTag']").should(
      "have.value",
      "Test read group tag"
    )
    cy.get("select[name='processing']").should("have.value", testData.singleProcessing)
    cy.get("input[data-testid='processing']").should("have.value", testData.singleProcessingLabel)
  })

  it("should render Run form correctly when editing", () => {
    const testData = {
      title: "Test Run",
      referenceAlignment: "Standard",
      accessionId: "123456",
    }

    cy.clickFillForm("Run")

    cy.get("input[data-testid='title']").type(testData.title)
    cy.get("select[name='runType.referenceAlignment.assembly']").select(testData.referenceAlignment)
    cy.get("input[data-testid='runType.referenceAlignment.assembly.accessionId']").type(testData.accessionId)

    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select newly saved draft
    cy.chooseFromDrafts()
    cy.get("button[aria-label='Continue draft']").first().click()

    cy.get("select[name='runType.referenceAlignment.assembly']").should("have.value", testData.referenceAlignment)
    cy.get("input[data-testid='runType.referenceAlignment.assembly.accessionId']").should(
      "have.value",
      testData.accessionId
    )
  })

  it("should render form with checkboxes correctly", () => {
    const testData = {
      title: "Test Dataset",
    }

    cy.clickFillForm("Dataset")

    cy.get("input[data-testid='title']").type(testData.title)
    cy.get("[type='checkbox']").first().check()

    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select newly saved draft
    cy.chooseFromDrafts()
    cy.get("button[aria-label='Continue draft']").first().click()

    cy.get("[type='checkbox']").first().should("be.checked")

    // Test that checkbox clears with form clear -button
    cy.get("button[type=button]", { timeout: 10000 }).contains("Clear form").click()
    cy.get("[type='checkbox']").first().should("not.be.checked")
  })
})
