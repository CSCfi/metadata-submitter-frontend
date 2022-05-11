import { FormInput } from "../support/types"

import { DisplayObjectTypes, ObjectTypes } from "constants/wizardObject"

describe("Basic application flow", function () {
  beforeEach(() => {
    cy.task("resetDb")
  })

  it("should navigate to home with click of login button", () => {
    cy.login()
  })

  it("completes all steps and publishes new submission", () => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create submission").click()

    /*
     * 1st step, Submission details
     */

    // Add folder name & description, navigate to submissions
    cy.newSubmission()

    /*
     * 2nd step, Study, DAC and Policy
     */

    // Try to send invalid form
    cy.formActions("Submit")

    cy.get<FormInput[]>("input[data-testid='descriptor.studyTitle']").then($input => {
      expect($input[0].validationMessage).to.contain("Please fill")
    })

    // Fill a Study form and submit object
    cy.get("[data-testid='descriptor.studyTitle']").type("Test title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Test title")

    cy.formActions("Clear form")

    cy.get("[data-testid='descriptor.studyTitle']").type("New title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.get("[data-testid='descriptor.studyAbstract']").type("New abstract")

    // Submit form
    cy.formActions("Submit")
    cy.get("[data-testid='study-objects-list']").find("li").should("have.length", 1)

    // DAC form
    cy.clickAddObject(DisplayObjectTypes.dac)

    // Try to submit empty DAC form. This should be invalid
    cy.get("[data-testid=title]").type("Test title")
    cy.formActions("Submit")
    cy.get("span").contains("must have at least 1 item")

    cy.get("h5").contains("Contacts").parents().children("button").click()
    cy.get("[data-testid='contacts.0.name']").type("Test contact name")
    // Test invalid email address (form array, default)
    cy.get("[data-testid='contacts.0.email']").type("email")
    cy.get("p[id='contacts.0.email-helper-text']").contains("must match format")

    cy.get("[data-testid='contacts.0.email']").type("@test.com")
    cy.get("[data-testid='contacts.0.telephoneNumber']").type("123456789")
    cy.get("[data-testid='contacts.0.organisation-inputField']").type("Test organization")
    // Click outside from organisation autocomplete field to hide suggestions
    cy.get("[data-testid='contacts.0.telephoneNumber']").click()
    cy.get("[data-testid='contacts.0.mainContact']").check()

    // Submit DAC form
    cy.formActions("Submit")

    // Test DAC form update
    cy.get("[data-testid='dac-objects-list']").within(() => {
      cy.get("a").contains("Test contact name").click()
    })

    cy.get("[data-testid='contacts']").should("be.visible")
    cy.get("input[data-testid='contacts.0.name']", { timeout: 1000 }).should("be.visible").click({ force: true })
    cy.get("input[data-testid='contacts.0.name']").type(" edited")
    cy.get("[data-testid='contacts.0.name']").should("have.value", "Test contact name edited")

    cy.formActions("Update")

    cy.get("[data-testid='dac-objects-list']").within(() => {
      cy.get("a").contains("Test contact name").click()
    })
    cy.get("[data-testid='contacts.0.name']").should("have.value", "Test contact name edited")

    // Fill Policy form
    cy.clickAddObject(ObjectTypes.policy)
    cy.get("[data-testid='title']").type("Test Policy title")
    cy.get("select[data-testid='dacRef.accessionId']").select(1)

    cy.get("select[data-testid='dacRef.accessionId']").should("contain", " - Main Contact:")

    cy.get("select[data-testid='policy']").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")

    // Submit Policy form
    cy.formActions("Submit")

    /*
     * 3rd step, Describe
     */

    cy.clickAccordionPanel("Datafolder")
    cy.get("[data-testid='datafolder-details']", { timeout: 10000 }).should("be.visible")
    cy.get("button[role=button]", { timeout: 10000 }).contains("Link datafolder").click()

    /*
     * 4th step, Datafolder
     */
    cy.clickAccordionPanel("Describe")

    // Fill a Sample form
    cy.clickAddObject(ObjectTypes.sample)
    cy.get("[data-testid='title']").type("Test Sample title")
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    // Submit Sample form
    cy.formActions("Submit")

    // Fill a Experiment form
    cy.clickAddObject(ObjectTypes.experiment)
    cy.get("[data-testid='title']").type("Test Experiment title")

    cy.get("select[data-testid='platform']").select("AB 5500 Genetic Analyzer")
    cy.get("select[data-testid='platform']").should("have.value", "AB 5500 Genetic Analyzer")

    // Select studyAccessionId
    cy.get("select[data-testid='studyRef.accessionId']").select(1)

    cy.get("select[data-testid='studyRef.accessionId']").should("contain", " - Title:")

    cy.get("textarea[data-testid='design.designDescription']").type("Design description")
    cy.get("select[data-testid='design.sampleDescriptor']").select("Individual Sample")
    cy.get("select[data-testid='design.sampleDescriptor']").should("have.value", "Individual Sample")

    // Select sampleAccessionId
    cy.get("select[data-testid='design.sampleDescriptor.accessionId']").select(1)

    cy.get("select[data-testid='design.sampleDescriptor.accessionId']").should("contain", " - Title:")

    cy.get("select[data-testid='design.libraryDescriptor.libraryStrategy']").select("AMPLICON")
    cy.get("select[data-testid='design.libraryDescriptor.libraryStrategy']").should("have.value", "AMPLICON")
    cy.get("select[data-testid='design.libraryDescriptor.librarySource']").select("GENOMIC")
    cy.get("select[data-testid='design.libraryDescriptor.librarySource']").should("have.value", "GENOMIC")
    cy.get("select[data-testid='design.libraryDescriptor.librarySelection']").select("CAGE")
    cy.get("select[data-testid='design.libraryDescriptor.librarySelection']", { timeout: 10000 }).should(
      "have.value",
      "CAGE"
    )

    // Submit Experiment form
    cy.formActions("Submit")

    // Fill a Run form
    cy.clickAddObject(ObjectTypes.run)
    cy.get("[data-testid='title']").type("Test Run title")
    cy.get("h5[data-testid='experimentRef']").parents().children("button").click()

    // Select experimentAccessionId
    cy.get("select[data-testid='experimentRef.0.accessionId']").select(1)

    cy.get("select[data-testid='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Submit Run form
    cy.formActions("Submit")

    // Fill an Analysis form
    cy.clickAddObject(ObjectTypes.analysis)

    cy.get("form").within(() => {
      cy.get("[data-testid='title']").type("Test title")

      // Analysis type
      cy.get("select[data-testid='analysisType']").select("Reference Alignment")
      cy.get("select[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
      cy.get("[data-testid='analysisType.referenceAlignment.assembly.accession']").type("Standard Accession version")
      cy.get("h5").contains("Sequence").parents().children("button").click()
      cy.get("[data-testid='analysisType.referenceAlignment.sequence.0.accession']").type(
        "Sequence Standard Accession Id"
      )

      // Study
      // Select studyAccessionId
      cy.get("select[data-testid='studyRef.accessionId']").select(1)
      cy.get("[data-testid='studyRef.refname']").type("Study Test Record Name")
      cy.get("[data-testid='studyRef.refcenter']").type("Study Test Namespace")

      // Experiment
      cy.get("[data-testid='experimentRef.accessionId']").select(1)
      cy.get("[data-testid='experimentRef.refcenter']").type("Experiment Test Record Name")
      cy.get("[data-testid='experimentRef.refname']").type("Experiment Test Namespace")

      // Sample
      cy.get("h5").contains("Sample Reference").parents().children("button").click()
      cy.get("[data-testid='sampleRef.0.accessionId']").select(1)
      cy.get("[data-testid='sampleRef.0.identifiers.submitterId.namespace']").type("Sample Test Namespace")
      cy.get("[data-testid='sampleRef.0.identifiers.submitterId.value']").type("Sample Test Value")

      // Run
      cy.get("h5").contains("Run Reference").parents().children("button").click()
      cy.get("[data-testid='runRef.0.accessionId']").select(1)
      cy.get("[data-testid='runRef.0.identifiers.submitterId.namespace']").type("Run Test Namespace")
      cy.get("[data-testid='runRef.0.identifiers.submitterId.value']").type("Run Test Value")

      // Analysis
      cy.get("h5").contains("Analysis Reference").parents().children("button").click()
      cy.get("[data-testid='analysisRef.0.accessionId']").type("Analysis Test Accession Id")
      cy.get("[data-testid='analysisRef.0.identifiers.submitterId.namespace']").type("Analysis Test Namespace")
      cy.get("[data-testid='analysisRef.0.identifiers.submitterId.value']").type("Analysis Test Value")

      // Files
      cy.get("h5").contains("Files").parents().children("button").click()
      cy.get("[data-testid='files.0.filename']").type("filename 1")
      cy.get("select[data-testid='files.0.filetype']").select("other")
      cy.get("select[data-testid='files.0.checksumMethod']").select("MD5")
      cy.get("[data-testid='files.0.checksum']").type("b1f4f9a523e36fd969f4573e25af4540")

      cy.get("h5").contains("Files").parents().children("button").click()
      cy.get("[data-testid='files.1.filename']").type("filename 2")
      cy.get("select[data-testid='files.1.filetype']").select("info")
      cy.get("select[data-testid='files.1.checksumMethod']").select("SHA-256")
      cy.get("[data-testid='files.1.checksum']").type(
        "c34045c1a1db8d1b3fca8a692198466952daae07eaf6104b4c87ed3b55b6af1b"
      )
    })
    // Submit Analysis form
    cy.formActions("Submit")

    // Fill a Dataset form
    cy.clickAddObject(ObjectTypes.dataset)

    cy.get("[data-testid='title']").type("Test Dataset title")
    cy.get("[data-testid='description']").type("Dataset description")
    cy.get("[data-testid='datasetType']").first().check()

    // Select policyAccessionId
    cy.get("select[data-testid='policyRef.accessionId']").select(1)
    cy.get("select[data-testid='policyRef.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("select[data-testid='runRef.0.accessionId']").select(1)
    cy.get("select[data-testid='runRef.0.accessionId']").should("contain", " - Title:")

    // Select analysisAccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("select[data-testid='analysisRef.0.accessionId']").select(1)
    cy.get("select[data-testid='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Dataset form
    cy.formActions("Submit")

    /*
     * 5th step, Identifier and publish
     */
    cy.clickAccordionPanel("publish")
    cy.get("button[role=button]", { timeout: 10000 }).contains("Publish").click()

    // Check the amount of submitted objects in each object type
    cy.get("h6").contains("Study").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("DAC").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Policy").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Sample").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Experiment").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Run").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Analysis").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Dataset").parents("div").children().eq(1).should("have.text", 1)

    cy.get("button[data-testid='summary-publish']").contains("Publish").click()
    cy.get("[data-testid='alert-dialog-content']").should("have.text", "Objects in this folder will be published.")
    cy.get('[data-testid="confirm-publish-folder"]').contains("Publish").click()
  })
})

export {}
