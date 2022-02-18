describe("Linking Accession Ids", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })
  it("should link correct accessionIds to the related objects", () => {
    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()
    // Upload a Study xml file.
    cy.get("div[role=button]")
      .contains("Study")
      .should("be.visible")
      .then($el => $el.click())
    cy.get("div[role=button]").contains("Upload XML File").click()
    cy.fixture("study_test.xml").then(fileContent => {
      cy.get("[data-testid='xml-upload']").attachFile(
        {
          fileContent: fileContent.toString(),
          fileName: "testFile.xml",
          mimeType: "text/xml",
        },
        { force: true }
      )
    })
    // Cypress doesn't allow form validation status to update and therefore "send" button is disabled
    cy.get("form").submit()

    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get studyAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("studyAccessionId")

    // Fill a Sample form
    cy.clickFillForm("Sample")
    cy.get("[data-testid='title']").type("Test Sample title")
    cy.get("[data-testid='sampleName.taxonId']").type("123")
    // Submit Sample form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get sampleAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("sampleAccessionId")

    // Experiment form
    cy.clickFillForm("Experiment")
    cy.get("[data-testid='title']").type("Test Experiment title")

    cy.get("select[data-testid='platform']").select("AB 5500 Genetic Analyzer")
    cy.get("select[data-testid='platform']").should("have.value", "AB 5500 Genetic Analyzer")

    // Select studyAccessionId
    cy.get("@studyAccessionId").then(id =>
      cy.get("select[data-testid='studyRef.accessionId']").select(`${id} - File name: testFile.xml`)
    )

    cy.get("select[data-testid='studyRef.accessionId']").should("contain", " - File name:")

    cy.get("textarea[data-testid='design.designDescription']").type("Design description")
    cy.get("select[data-testid='design.sampleDescriptor']").select("Individual Sample")
    cy.get("select[data-testid='design.sampleDescriptor']").should("have.value", "Individual Sample")

    // Select sampleAccessionId
    cy.get("@sampleAccessionId").then(id =>
      cy.get("select[data-testid='design.sampleDescriptor.accessionId']").select(`${id} - Title: Test Sample title`)
    )

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
    cy.get("[data-testid='Form-objects']", { timeout: 10000 }).should("have.length", 1)

    // Get experimentAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("experimentAccessionId")

    // Run form
    cy.clickFillForm("Run")
    cy.get("[data-testid='title']").type("Test Run title")
    cy.get("h5[data-testid='experimentRef']").parents().children("button").click()

    // Select experimentAccessionId
    cy.get("@experimentAccessionId").then(id =>
      cy.get("select[data-testid='experimentRef.0.accessionId']").select(`${id} - Title: Test Experiment title`)
    )

    cy.get("select[data-testid='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Submit Run form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get runAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("runAccessionId")

    // Analysis form
    cy.clickFillForm("Analysis")
    cy.get("[data-testid='title']").type("Test Analysis title")
    cy.get("select[data-testid='analysisType']").select("Reference Alignment")
    cy.get("select[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[data-testid='analysisType.referenceAlignment.assembly.accession']").type("Standard accessionId")

    // Select studyAccessionId
    cy.get("@studyAccessionId").then(id =>
      cy.get("select[data-testid='studyRef.accessionId']").select(`${id} - File name: testFile.xml`)
    )

    cy.get("select[data-testid='studyRef.accessionId']").should("contain", " - File name:")

    // Select experimentAccessionId
    cy.get("@experimentAccessionId").then(id =>
      cy.get("select[data-testid='experimentRef.accessionId']").select(`${id} - Title: Test Experiment title`)
    )

    cy.get("select[data-testid='experimentRef.accessionId']").should("contain", " - Title:")

    // Select sampleAccessionId
    cy.get("div").contains("Sample Reference").parents().children("button").click()
    cy.get("@sampleAccessionId").then(id =>
      cy.get("select[data-testid='sampleRef.0.accessionId']").select(`${id} - Title: Test Sample title`)
    )

    cy.get("select[data-testid='sampleRef.0.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("@runAccessionId").then(id =>
      cy.get("select[data-testid='runRef.0.accessionId']").select(`${id} - Title: Test Run title`)
    )

    cy.get("select[data-testid='runRef.0.accessionId']").should("contain", " - Title:")

    // Submit Analysis form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get analysisAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("analysisAccessionId")

    // Another Analysis form
    cy.formActions("New form")
    cy.get("[data-testid='title']").type("Test Analysis title 2")
    cy.get("select[data-testid='analysisType']").select("Reference Alignment")
    cy.get("select[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[data-testid='analysisType.referenceAlignment.assembly.accession']").type("Standard accessionId 2")

    // Select the other Analysis AccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()

    cy.get("@analysisAccessionId").then(id =>
      cy.get("select[data-testid='analysisRef.0.accessionId']").select(`${id} - Title: Test Analysis title`)
    )

    cy.get("select[data-testid='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Analysis form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Fill DAC form
    cy.clickFillForm("DAC")

    cy.get("h5[data-testid='contacts']").parents().children("button").click()
    cy.get("[data-testid='contacts.0.name']").type("Test contact name")
    cy.get("[data-testid='contacts.0.email']").type("contact@hotmail.com")
    cy.get("[data-testid='contacts.0.telephoneNumber']").type("Test phone number")
    cy.get("[data-testid='contacts.0.organisation-inputField']").type("CSC")
    // Hide autosuggest suggestions by clicking another field
    cy.get("[data-testid='contacts.0.telephoneNumber']").click()
    cy.get("[data-testid='contacts.0.mainContact']").check()
    // Submit DAC form
    cy.get("[data-testid=title]").type("test description")
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    // Get DACAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("dacAccessionId")

    // Fill Policy form
    cy.clickFillForm("Policy")
    cy.get("[data-testid='title']").type("Test Policy title")
    cy.get("@dacAccessionId").then(id =>
      cy.get("select[data-testid='dacRef.accessionId']").select(`${id} - Main Contact: Test contact name`)
    )

    cy.get("select[data-testid='dacRef.accessionId']").should("contain", " - Main Contact:")

    cy.get("select[data-testid='policy']").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")
    // Submit Policy form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    // Get policyAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("policyAccessionId")

    // Fill Dataset form
    cy.clickFillForm("Dataset")
    cy.get("[data-testid='title']").type("Test Dataset title")
    cy.get("[data-testid='description']").type("Dataset description")
    cy.get("[data-testid='datasetType']").first().check()

    // Select policyAccessionId
    cy.get("@policyAccessionId").then(id =>
      cy.get("select[data-testid='policyRef.accessionId']").select(`${id} - Title: Test Policy title`)
    )

    cy.get("select[data-testid='policyRef.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("@runAccessionId").then(id =>
      cy.get("select[data-testid='runRef.0.accessionId']").select(`${id} - Title: Test Run title`)
    )

    cy.get("select[data-testid='runRef.0.accessionId']").should("contain", " - Title:")

    // Select analysisAccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("@analysisAccessionId").then(id =>
      cy.get("select[data-testid='analysisRef.0.accessionId']").select(`${id} - Title: Test Analysis title`)
    )

    cy.get("select[data-testid='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Dataset form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
  })
})

export {}
