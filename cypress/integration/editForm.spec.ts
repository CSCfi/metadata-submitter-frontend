import { FormInput } from "../support/types"

import { ObjectTypes } from "constants/wizardObject"

describe("Populate form and render form elements by object data", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    cy.generateFolderAndObjects()
    // Edit newly created folder
    cy.contains("Edit").click({ force: true })

    // Open 4th step
    cy.clickAccordionPanel("Describe")
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

    cy.clickAddObject(ObjectTypes.sample)

    cy.get("[data-testid='title']").type(testData.title)
    cy.get("[data-testid='sampleName.taxonId']").type(testData.taxonId)
    cy.get("select[data-testid='sampleData']").select(testData.sampleData1)
    cy.get("select[data-testid='sampleData.gender']").select(testData.gender)

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Clear form
    cy.get("button[type=button]").contains("Clear").click()

    // Edit saved submission
    cy.get("[data-testid='sample-objects-list']").within(() => {
      cy.get("a").contains(testData.title).click()
    })
    cy.get("[data-testid='title']").should("have.value", testData.title)

    // Try to submit invalid form
    cy.get("[data-testid='title']").clear()
    cy.get("button[type=submit]").contains("Update").click()
    cy.get<FormInput[]>("[data-testid='title']").then($input => {
      expect($input[0].validationMessage).to.contain("Please fill")
    })

    // Edit form
    cy.get("[data-testid='title']", { timeout: 10000 }).focus().type(`${testData.title} edited`).blur()
    cy.get("[data-testid='title']").should("have.value", `${testData.title} edited`)
    cy.get("[data-testid='sampleName.taxonId']").should("have.value", testData.taxonId)
    cy.get("select[data-testid='sampleData']").should("have.value", testData.sampleData1)
    cy.get("select[data-testid='sampleData.gender']").should("have.value", testData.gender)

    // Change Sample Data Type to Non Human Sample
    cy.get("select[data-testid='sampleData']").select(testData.sampleData2)
    cy.get("[data-testid='sampleData.dataDescription']").type(testData.sampleTypeDescription)
    cy.get("button[type=submit]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")

    // Check Sample form renders Non Human Sample now
    cy.get("[data-testid='sample-objects-list']").within(() => {
      cy.get("a").contains(testData.title).click()
    })
    cy.get("select[data-testid='sampleData']").should("have.value", testData.sampleData2)
    cy.get("[data-testid='sampleData.dataDescription']").should("have.value", testData.sampleTypeDescription)

    // Clear object in state
    cy.formActions("New form")

    // Test updated title
    cy.get("[data-testid='sample-objects-list']").find("li").should("have.length", 2)
    cy.get("[data-testid='sample-objects-list']").within(() => {
      cy.get("a").contains(testData.title).click()
    })
    cy.get("[data-testid='title']").should("have.value", `${testData.title} edited`)
  })

  it("should render Experiment form correctly when editing", () => {
    const testData = {
      title: "Test experiment",
      description: "Test experiment description",
      designDescription: "Test design description",
      sampleReference: "Individual Sample",
      singleProcessing: "Single Processing",
      singleProcessingLabel: "Single Processing label",
      complexProcessing: "Complex Processing",
      stepIndex: "Step Index",
      stringValue: "String value",
      nullValue: "Null value",
      prevStepIndexValue: "Test prev index",
    }

    cy.clickAddObject(ObjectTypes.experiment)

    cy.get("[data-testid='title']").type(testData.title)
    cy.get("[data-testid='description']").type(testData.description)
    cy.get("[data-testid='design.designDescription']").type(testData.designDescription)
    cy.get("select[data-testid='design.sampleDescriptor']", { timeout: 10000 }).select(testData.sampleReference)
    cy.get("[data-testid='design.sampleDescriptor.accessionId']").select(1)
    cy.get("[data-testid='design.sampleDescriptor.accessionId-option")
      .then($el => $el.text())
      .as("sampleAccessionId")

    // Expected Base Call Table
    cy.get("div").contains("Expected Base Call Table").parents().children("button").click()
    cy.get("[data-testid='design.spotDescriptor.readSpec.expectedBaseCallTable.0.baseCall']").type("Test base call")
    cy.get("[data-testid='design.spotDescriptor.readSpec.expectedBaseCallTable.0.readGroupTag']").type(
      "Test read group tag"
    )

    // Save Experiment form
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    cy.continueLatestDraft(ObjectTypes.experiment)

    // Test that values exist
    cy.get("[data-testid='title']").should("have.value", testData.title)
    cy.get("[data-testid='description']").should("have.value", testData.description)
    cy.get("[data-testid='design.designDescription']").should("have.value", testData.designDescription)
    cy.get("select[data-testid='design.sampleDescriptor']").should("have.value", testData.sampleReference)
    cy.get("@sampleAccessionId").then(id => {
      cy.get("select[data-testid='design.sampleDescriptor.accessionId']").should("have.value", id)
    })
    cy.get("[data-testid='design.spotDescriptor.readSpec.expectedBaseCallTable.0.baseCall']").should(
      "have.value",
      "Test base call"
    )
    cy.get("[data-testid='design.spotDescriptor.readSpec.expectedBaseCallTable.0.readGroupTag']").should(
      "have.value",
      "Test read group tag"
    )

    // Save Experiment form 2nd time
    cy.get("button[type='button']").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    cy.continueLatestDraft(ObjectTypes.experiment)
  })

  it("should render Run form correctly when editing", () => {
    const testData = {
      title: "Test Run",
      referenceAlignment: "Standard",
      accessionId: "123456",
    }

    cy.clickAddObject(ObjectTypes.run)

    cy.get("[data-testid='title']").type(testData.title)
    cy.get("select[data-testid='runType.referenceAlignment.assembly']").select(testData.referenceAlignment)
    cy.get("[data-testid='runType.referenceAlignment.assembly.accession']").type(testData.accessionId)

    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select newly saved draft
    cy.continueLatestDraft(ObjectTypes.run)

    cy.get("[data-testid='runType.referenceAlignment.assembly']").should("have.value", testData.referenceAlignment)
    cy.get("[data-testid='runType.referenceAlignment.assembly.accession']").should("have.value", testData.accessionId)
  })

  it("should render form with checkboxes correctly", () => {
    const testData = {
      title: "Test Dataset",
    }

    cy.clickAddObject(ObjectTypes.dataset)

    cy.get("[data-testid='title']").type(testData.title)
    cy.get("[type='checkbox']").first().check()

    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Select newly saved draft
    cy.continueLatestDraft(ObjectTypes.dataset)

    cy.get("[type='checkbox']").first().should("be.checked")

    // Test that checkbox clears with form clear -button
    cy.get("button[type=button]")
      .contains("Clear form")
      .should("be.visible")
      .then($el => $el.click())
    cy.get("[type='checkbox']").first().should("not.be.checked")
  })

  it("should not remove the draft object when submitting invalid form", () => {
    cy.clickAddObject(ObjectTypes.sample)
    cy.get("[data-testid='title']").type("Test sample title")
    // Save draft
    cy.get("button[type='button']").contains("Save as Draft").click()
    // Edit the draft and try to submit invalid form
    cy.continueLatestDraft(ObjectTypes.sample)
    cy.get("button[type=submit]").contains("Submit").click()
    // Taxon field should be empty and the draft cannot be submitted yet
    cy.get("[data-testid='sampleName.taxonId']").should("have.value", "")
    cy.get("[data-testid='Draft-objects']").should("have.length", 1)

    // Fill in taxonId and submit the form again
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    cy.get("button[type=submit]").contains("Submit").click()

    // Check that the draft is removed from the draft objects list and submitted
    cy.get(`[data-testid='sample-objects-list']`).within(() => {
      cy.get(`[data-testid='draft-sample-list-item']`).should("not.exist")
    })
    cy.get("[data-testid='sample-objects-list']").find("li").should("have.length", 2) // Initial generated object + newly created
  })
})

export {}
