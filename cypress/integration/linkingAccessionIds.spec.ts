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
    cy.get("div[role=button]").contains("Sample").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
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
    cy.get("div[role=button]").contains("Experiment").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("[data-testid='title']").type("Test Experiment title")
    cy.get("[data-testid='studyRef.label']").type("Study Label")

    // Select studyAccessionId
    cy.get("select[data-testid='studyRef.accessionId']").then(($el: any) => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.click()
      $el.select(studyAccessionId)
    })
    cy.get("select[data-testid='studyRef.accessionId']").should("contain", " - File name:")

    cy.get("textarea[data-testid='design.designDescription']").type("Design description")
    cy.get("select[data-testid='design.sampleDescriptor']").select("Individual Sample")
    cy.get("input[data-testid='design.sampleDescriptor.label']").type("Sample label")
    // Select sampleAccessionId
    cy.get("select[data-testid='design.sampleDescriptor.accessionId']").then(($el: any) => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })
    cy.get("select[data-testid='design.sampleDescriptor.accessionId']").should("contain", " - Title:")

    cy.get("select[data-testid='design.libraryDescriptor.libraryStrategy']").select("AMPLICON")
    cy.get("select[data-testid='design.libraryDescriptor.librarySource']").select("GENOMIC")
    cy.get("select[data-testid='design.libraryDescriptor.librarySelection']").select("CAGE")
    cy.get("select[data-testid='platform']").select("AB 5500 Genetic Analyzer")
    // Submit Experiment form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get experimentAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("experimentAccessionId")

    // Run form
    cy.get("div[role=button]").contains("Run").click()
    cy.get("div[aria-expanded='true']", { timeout: 10000 })
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("[data-testid='title']").type("Test Run title")
    cy.get("h2[data-testid='experimentRef']").parents().children("button").click()
    cy.get("[data-testid='experimentRef.0.label']").type("Test experiment label ref")
    // Select experimentAccessionId
    cy.get("select[data-testid='experimentRef.0.accessionId']").then(($el: any) => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
    cy.get("select[data-testid='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Submit Run form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get runAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("runAccessionId")

    // Analysis form
    cy.get("div[role=button]").contains("Analysis").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("[data-testid='title']").type("Test Analysis title")
    cy.get("select[data-testid='analysisType']").select("Reference Alignment")
    cy.get("select[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[data-testid='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId")
    // Select studyAccessionId
    cy.get("select[data-testid='studyRef.accessionId']").then(($el: any) => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.select(studyAccessionId)
    })
    cy.get("select[data-testid='studyRef.accessionId']").should("contain", " - File name:")

    // Select experimentAccessionId
    cy.get("div").contains("Experiment Reference").parents().children("button").click()
    cy.get("select[data-testid='experimentRef.0.accessionId']").then(($el: any) => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
    cy.get("select[data-testid='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Select sampleAccessionId
    cy.get("div").contains("Sample Reference").parents().children("button").click()
    cy.get("select[data-testid='sampleRef.0.accessionId']").then(($el: any) => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })
    cy.get("select[data-testid='sampleRef.0.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("select[data-testid='runRef.0.accessionId']").then(($el: any) => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })
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
    cy.get("input[data-testid='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId 2")

    // Select the other Analysis AccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("select[data-testid='analysisRef.0.accessionId']").then(($el: any) => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })
    cy.get("select[data-testid='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Analysis form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Fill DAC form
    cy.get("div[role=button]").contains("DAC").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )

    cy.get("h2[data-testid='contacts']").parents().children("button").click()
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
    cy.get("div[role=button]").contains("Policy").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )
    cy.get("[data-testid='title']").type("Test Policy title")
    cy.get("input[data-testid='dacRef.label']").type("Test DAC")
    cy.get("select[data-testid='dacRef.accessionId']").then(($el: any) => {
      const dacAccessionId = cy.get("@dacAccessionId")
      $el.select(dacAccessionId)
    })
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
    cy.get("div[role=button]").contains("Dataset").click()
    cy.get("div[aria-expanded='true']")
      .siblings()
      .within(() =>
        cy
          .get("div[role=button]")
          .contains("Fill Form", { timeout: 10000 })
          .should("be.visible")
          .then($btn => $btn.click())
      )

    cy.get("[data-testid='title']").type("Test Dataset title")
    cy.get("[data-testid='description']").type("Dataset description")
    cy.get("[data-testid='datasetType']").first().check()

    // Select policyAccessionId
    cy.get("select[data-testid='policyRef.accessionId']").then(($el: any) => {
      const policyAccessionId = cy.get("@policyAccessionId")
      $el.select(policyAccessionId)
    })
    cy.get("select[data-testid='policyRef.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("select[data-testid='runRef.0.accessionId']").then(($el: any) => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })
    cy.get("select[data-testid='runRef.0.accessionId']").should("contain", " - Title:")

    // Select analysisAccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("select[data-testid='analysisRef.0.accessionId']").then(($el: any) => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })
    cy.get("select[data-testid='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Dataset form
    cy.formActions("Submit")
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
  })
})

export {}
