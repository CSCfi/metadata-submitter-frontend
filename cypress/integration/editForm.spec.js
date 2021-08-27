describe("Populate form and render form elements by object data", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
  })

  it("should submit Sample form and display all form values when editing the form", () => {
    const testData = {
      title: "Sample test title",
      taxonId: "123456",
      sampleData1: "Human Sample",
      gender: "unknown",
      sampleData2: "Non Human Sample",
      sampleTypeDescription: "Non Human Sample Description",
    }

    cy.clickFillForm("Sample")

    cy.get("input[name='title']").type(testData.title)
    cy.get("input[name='sampleName.taxonId']").type(testData.taxonId)
    cy.get("select[name='sampleData']").select(testData.sampleData1)
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
    cy.get("select[name='sampleData']").should("have.value", testData.sampleData1)
    cy.get("select[name='sampleData.gender']").should("have.value", testData.gender)

    // Change Sample Data Type to Non Human Sample
    cy.get("select[name='sampleData']").select(testData.sampleData2)
    cy.get("[data-testid='sampleData.dataDescription']").type(testData.sampleTypeDescription)
    cy.get("button[type=button]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")

    // Check Sample form renders Non Human Sample now
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("select[name='sampleData']").should("have.value", testData.sampleData2)
    cy.get("[data-testid='sampleData.dataDescription']").should("have.value", testData.sampleTypeDescription)

    // Clear object in state
    cy.get("button[type=button]", { timeout: 10000 }).contains("New form").should("exist")
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
      complexProcessing: "Complex Processing",
      stepIndex: "Step Index",
      stringValue: "String value",
      nullValue: "Null value",
      prevStepIndexValue: "Test prev index",
    }

    cy.clickFillForm("Experiment")

    cy.get("input[data-testid='title']").type(testData.title)
    cy.get("textarea[data-testid='description']").type(testData.description)
    cy.get("textarea[name='design.designDescription']").type(testData.designDescription)
    cy.get("select[name='design.sampleDescriptor']").select(testData.sampleReference)
    cy.get("input[data-testid='design.sampleDescriptor.label']").type(testData.individualSampleLabel)
    // Expected Base Call Table
    cy.get("div").contains("Expected Base Call Table").parents().children("button").click()
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].baseCall']").type("Test base call")
    cy.get("input[name='design.spotDescriptor.readSpec.expectedBaseCallTable[0].readGroupTag']").type(
      "Test read group tag"
    )

    // Select and fill Single processing
    cy.get("select[name='processing']").select(testData.singleProcessing)
    cy.get("[data-testid='processing']").type(testData.singleProcessingLabel)

    // Switch to select and fill Complex processing
    cy.get("select[name='processing']").select(testData.complexProcessing)
    cy.get("h2[data-testid='processing']").parents().children("button").click()
    cy.get(".MuiPaper-root > :nth-child(1) > .formSection > .array > .MuiButtonBase-root > .MuiButton-label").click()
    cy.get("input[data-testid='processing[0].pipeline.pipeSection[0].stepIndex']").type(testData.stepIndex)
    cy.get("select[name='processing[0].pipeline.pipeSection[0].prevStepIndex']", { force: true }).select(
      testData.stringValue
    )
    cy.get("input[data-testid='processing[0].pipeline.pipeSection[0].prevStepIndex']").type(testData.prevStepIndexValue)

    // Save Experiment form
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.continueFirstDraft()

    // Test that values exist
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
    cy.get("input[data-testid='processing[0].pipeline.pipeSection[0].stepIndex']").should(
      "have.value",
      testData.stepIndex
    )
    cy.get("input[data-testid='processing[0].pipeline.pipeSection[0].prevStepIndex']").should(
      "have.value",
      testData.prevStepIndexValue
    )

    // Change Prev Step Index from string value to null
    cy.get("select[name='processing[0].pipeline.pipeSection[0].prevStepIndex']").select(testData.nullValue)

    // Save Experiment form 2nd time
    cy.get("button[type='button']").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    cy.continueFirstDraft()

    // Test that Prev Step Index is nulled
    cy.get("input[data-testid='processing[0].pipeline.pipeSection[0].prevStepIndex']").should("not.exist")
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
    cy.continueFirstDraft()

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
    cy.continueFirstDraft()

    cy.get("[type='checkbox']").first().should("be.checked")

    // Test that checkbox clears with form clear -button
    cy.get("button[type=button]", { timeout: 10000 }).contains("Clear form").click()
    cy.get("[type='checkbox']").first().should("not.be.checked")
  })

  it("should not remove the draft object when submitting invalid form", () => {
    cy.clickFillForm("Sample")
    cy.get("[data-testid='title']").type("Test sample title")
    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    // Edit the draft and try to submit invalid form
    cy.continueFirstDraft()
    cy.get("button[type=submit]").contains("Submit").click()
    // Taxon field should be empty and the draft cannot be submitted yet
    cy.get("[data-testid='sampleName.taxonId']").should("have.value", "")
    cy.get("ul[data-testid='Draft-objects']").should("have.length", 1)

    // Fill in taxonId and submit the form again
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    cy.get("button[type=submit]").contains("Submit").click()

    // Check that the draft is removed from the draft objects list and submitted
    cy.get("ul[data-testid='Draft-objects']").should("have.length", 0)
    cy.get("ul[data-testid='Form-objects']").should("have.length", 1)
  })
})
