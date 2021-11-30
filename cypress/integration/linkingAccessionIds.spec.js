describe("Linking Accession Ids", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should link correct accessionIds to the related objects", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.wait(1000)
    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
    cy.wait(500)
    // Upload a Study xml file.
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Upload XML File").click()
    cy.fixture("study_test.xml").then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: "testFile.xml",
        mimeType: "text/xml",
        force: true,
      })
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
    cy.get("[data-testid='title']").type("Test Sample title")
    cy.get("[data-testid='sampleName.taxonId']").type(123)
    // Submit Sample form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get sampleAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("sampleAccessionId")

    // Experiment form
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
    cy.get("[data-testid='title']").type("Test Experiment title")
    cy.get("input[name='studyRef.label']").type("Study Label")

    // Select studyAccessionId
    cy.get("select[name='studyRef.accessionId']").then($el => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.click()
      $el.select(studyAccessionId)
    })
    cy.get("select[name='studyRef.accessionId']").should("contain", " - File name:")

    cy.get("textarea[name='design.designDescription']").type("Design description")
    cy.get("select[name='design.sampleDescriptor']").select("Individual Sample")
    cy.get("input[name='design.sampleDescriptor.label']").type("Sample label")
    // Select sampleAccessionId
    cy.get("select[name='design.sampleDescriptor.accessionId']").then($el => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })
    cy.get("select[name='design.sampleDescriptor.accessionId']").should("contain", " - Title:")

    cy.get("select[name='design.libraryDescriptor.libraryStrategy']").select("AMPLICON")
    cy.get("select[name='design.libraryDescriptor.librarySource']").select("GENOMIC")
    cy.get("select[name='design.libraryDescriptor.librarySelection']").select("CAGE")
    cy.get("select[name='platform']").select("AB 5500 Genetic Analyzer")
    // Submit Experiment form
    cy.get("button[type=submit]").contains("Submit").click()
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
    cy.get("select[name='experimentRef.0.accessionId']").then($el => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
    cy.get("select[name='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Submit Run form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get runAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("runAccessionId")

    // Analysis form
    cy.get("div[role=button]").contains("Analysis").click()
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
    cy.get("[data-testid='title']").type("Test Analysis title")
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId")
    // Select studyAccessionId
    cy.get("select[name='studyRef.accessionId']").then($el => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.select(studyAccessionId)
    })
    cy.get("select[name='studyRef.accessionId']").should("contain", " - File name:")

    // Select experimentAccessionId
    cy.get("div").contains("Experiment Reference").parents().children("button").click()
    cy.get("select[name='experimentRef.0.accessionId']").then($el => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
    cy.get("select[name='experimentRef.0.accessionId']").should("contain", " - Title:")

    // Select sampleAccessionId
    cy.get("div").contains("Sample Reference").parents().children("button").click()
    cy.get("select[name='sampleRef.0.accessionId']").then($el => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })
    cy.get("select[name='sampleRef.0.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("select[name='runRef.0.accessionId']").then($el => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })
    cy.get("select[name='runRef.0.accessionId']").should("contain", " - Title:")

    // Submit Analysis form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get analysisAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("analysisAccessionId")

    // Another Analysis form
    cy.get("button[type=button]").contains("New form").click()
    cy.get("[data-testid='title']").type("Test Analysis title 2")
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId 2")

    // Select the other Analysis AccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("select[name='analysisRef.0.accessionId']").then($el => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })
    cy.get("select[name='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Analysis form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Fill DAC form
    cy.get("div[role=button]").contains("DAC").click()
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

    cy.get("h2[data-testid='contacts']").parents().children("button").click()
    cy.get("input[name='contacts.0.name']").type("Test contact name")
    cy.get("input[name='contacts.0.email']").type("contact@hotmail.com")
    cy.get("input[name='contacts.0.telephoneNumber']").type("Test phone number")
    cy.get("input[name='contacts.0.organisation']").type("CSC")
    // Hide autosuggest suggestions by clicking another field
    cy.get("input[name='contacts.0.telephoneNumber']").click()
    cy.get("input[name='contacts.0.mainContact']").check()
    // Submit DAC form
    cy.get('[data-testid=title]').type("test description")
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    // Get DACAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("dacAccessionId")

    // Fill Policy form
    cy.get("div[role=button]").contains("Policy").click()
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
    cy.get("[data-testid='title']").type("Test Policy title")
    cy.get("input[name='dacRef.label']").type("Test DAC")
    cy.get("select[name='dacRef.accessionId']").then($el => {
      const dacAccessionId = cy.get("@dacAccessionId")
      $el.select(dacAccessionId)
    })
    cy.get("select[name='dacRef.accessionId']").should("contain", " - Main Contact:")

    cy.get("select[name='policy']").select("Policy Text")
    cy.get("textarea[name='policy.policyText']").type("Test policy text")
    // Submit Policy form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
    // Get policyAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("policyAccessionId")

    // Fill Dataset form
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

    cy.get("[data-testid='title']").type("Test Dataset title")
    cy.get("textarea[name='description']").type("Dataset description")
    cy.get("input[name='datasetType']").first().check()

    // Select policyAccessionId
    cy.get("select[name='policyRef.accessionId']").then($el => {
      const policyAccessionId = cy.get("@policyAccessionId")
      $el.select(policyAccessionId)
    })
    cy.get("select[name='policyRef.accessionId']").should("contain", " - Title:")

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parents().children("button").click()
    cy.get("select[name='runRef.0.accessionId']").then($el => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })
    cy.get("select[name='runRef.0.accessionId']").should("contain", " - Title:")

    // Select analysisAccessionId
    cy.get("div").contains("Analysis Reference").parents().children("button").click()
    cy.get("select[name='analysisRef.0.accessionId']").then($el => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })
    cy.get("select[name='analysisRef.0.accessionId']").should("contain", " - Title:")

    // Submit Dataset form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
  })
})
