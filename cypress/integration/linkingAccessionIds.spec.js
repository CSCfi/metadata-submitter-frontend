describe("Linking Accession Ids", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should link correct accessionIds to the related objects", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.wait(1000)
    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test study title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test study title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")
    cy.get("select[name='descriptor.studyType']").should("have.value", "Metagenomics")

    // Submit Study form
    cy.get("button[type=submit]").contains("Submit").click()
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
    cy.get("input[name='sampleName.taxonId']").type(123)
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
    cy.get("input[name='studyRef.label']").type("Study Label")

    // Select studyAccessionId
    cy.get("select[name='studyRef.accessionId']").then($el => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.select(studyAccessionId)
    })

    cy.get("textarea[name='design.designDescription']").type("Design description")
    cy.get("select[name='design.sampleDescriptor']").select("Individual Sample")
    cy.get("input[name='design.sampleDescriptor.label']").type("Sample label")
    // Select sampleAccessionId
    cy.get("select[name='design.sampleDescriptor.accessionId']").then($el => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })

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
    cy.get("div").contains("Experiment Reference").parent().children("button").click()
    // Select experimentAccessionId
    cy.get("select[name='experimentRef[0].accessionId']").then($el => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
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
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId")
    // Select studyAccessionId
    cy.get("select[name='studyRef.accessionId']").then($el => {
      const studyAccessionId = cy.get("@studyAccessionId")
      $el.select(studyAccessionId)
    })
    // Select experimentAccessionId
    cy.get("div").contains("Experiment Reference").parent().children("button").click()
    cy.get("select[name='experimentRef[0].accessionId']").then($el => {
      const experimentAccessionId = cy.get("@experimentAccessionId")
      $el.select(experimentAccessionId)
    })
    // Select sampleAccessionId
    cy.get("div").contains("Sample Reference").parent().children("button").click()
    cy.get("select[name='sampleRef[0].accessionId']").then($el => {
      const sampleAccessionId = cy.get("@sampleAccessionId")
      $el.select(sampleAccessionId)
    })
    // Select runAccessionId
    cy.get("div").contains("Run Reference").parent().children("button").click()
    cy.get("select[name='runRef[0].accessionId']").then($el => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })
    // Submit Analysis form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Get analysisAccessionId
    cy.get(".MuiListItem-container > div > div > p")
      .then($el => $el.text())
      .as("analysisAccessionId")

    // Another Analysis form
    cy.get("button[type=button]").contains("New form").click()
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard accessionId 2")

    // Select the other Analysis AccessionId
    cy.get("div").contains("Analysis Reference").parent().children("button").click()
    cy.get("select[name='analysisRef[0].accessionId']").then($el => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })

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

    cy.get("div").contains("Contacts").parent().children("button").click()
    cy.get("input[name='contacts[0].name']").type("Test contact name")
    cy.get("input[name='contacts[0].email']").type("contact@hotmail.com")
    cy.get("input[name='contacts[0].telephoneNumber']").type("Test phone number")
    cy.get("input[name='contacts[0].organisation']").type("CSC")
    cy.get("input[name='contacts[0].mainContact']").check()
    // Submit DAC form
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
    cy.get("input[name='dacRef.label']").type("Test DAC")
    cy.get("select[name='dacRef.accessionId']").then($el => {
      const dacAccessionId = cy.get("@dacAccessionId")
      $el.select(dacAccessionId)
    })
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

    cy.get("input[name='title']").type("Dataset title")
    cy.get("textarea[name='description']").type("Dataset description")
    cy.get("input[name='datasetType']").first().check()

    // Select policyAccessionId
    cy.get("select[name='policyRef.accessionId']").then($el => {
      const policyAccessionId = cy.get("@policyAccessionId")
      $el.select(policyAccessionId)
    })

    // Select runAccessionId
    cy.get("div").contains("Run Reference").parent().children("button").click()
    cy.get("select[name='runRef[0].accessionId']").then($el => {
      const runAccessionId = cy.get("@runAccessionId")
      $el.select(runAccessionId)
    })

    // Select analysisAccessionId
    cy.get("div").contains("Analysis Reference").parent().children("button").click()
    cy.get("select[name='analysisRef[0].accessionId']").then($el => {
      const analysisAccessionId = cy.get("@analysisAccessionId")
      $el.select(analysisAccessionId)
    })
    // Submit Dataset form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)
  })
})
