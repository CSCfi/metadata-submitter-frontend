describe("DOI form", function () {
  it("should render DOI form correctly with affiliation's autocomplete field and formats' prefilled values ", () => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    cy.wait(500)

    // Fill in Run form
    cy.clickFillForm("Run")

    const testRunData = {
      title: "Test Run",
      experimentRefLabel: "Test Experiment reference label",
    }

    cy.get("input[data-testid='title']").type(testRunData.title)
    cy.get("h2[data-testid='experimentRef']").parents().children("button").click()
    cy.get("[data-testid='experimentRef.0.label']").type(testRunData.experimentRefLabel)

    const testRunFile = {
      fileName: "Run file name",
      fileType: "bam",
      checksumMethod: "MD5",
      checksum: "Run file check sum",
    }
    cy.get("h2[data-testid='files']").parents().children("button").click()
    cy.get("input[name='files.0.filename']").type(testRunFile.fileName)
    cy.get("select[name='files.0.filetype']").select(testRunFile.fileType)
    cy.get("select[name='files.0.checksumMethod']").select(testRunFile.checksumMethod)
    cy.get("input[name='files.0.checksum']").type(testRunFile.checksum)

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()

    // Submitted objects list should have newly added item from Run form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Fill in Analysis form
    cy.clickFillForm("Analysis")

    const testAnalysisData = {
      title1: "Test Analysis",
      title2: "Test Analysis 2",
      analysisType: "Reference Alignment",
      refAlignmentAssembly: "Standard",
      refAlignmentAssemblyId: "Standard Accession Id",
    }

    cy.get("input[name='title']").type(testAnalysisData.title1)
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard Accession Id")

    const testAnalysisFile = {
      fileName: "Analysis file name",
      fileType1: "cram",
      fileType2: "bam",
      checksumMethod: "SHA-256",
      checksum: "Analysis file check sum",
    }
    // Select fileType
    cy.get("h2[data-testid='files']").parents().children("button").click()
    cy.get("input[name='files.0.filename']").type(testAnalysisFile.fileName)
    cy.get("select[name='files.0.filetype']").select(testAnalysisFile.fileType1)
    cy.get("select[name='files.0.checksumMethod']").select(testAnalysisFile.checksumMethod)
    cy.get("input[name='files.0.checksum']").type(testAnalysisFile.checksum)

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()

    // Submitted objects list should have newly added item from Run form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Fill another Analysis form with the same fileType as Run form: "bam"
    cy.get("button").contains("New form").click()
    cy.get("input[name='title']").type(testAnalysisData.title2)
    cy.get("select[name='analysisType']").select("Reference Alignment")
    cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard Accession Id")
    // Select fileType
    cy.get("input[name='files.0.filename']").type(testAnalysisFile.fileName)
    cy.get("select[name='files.0.filetype']").select(testAnalysisFile.fileType2)
    cy.get("select[name='files.0.checksumMethod']").select(testAnalysisFile.checksumMethod)
    cy.get("input[name='files.0.checksum']").type(testAnalysisFile.checksum)

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()

    // Submitted objects list should have newly added item from Run form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Go to DOI form
    cy.get("button[type=button]").contains("Next").click()
    cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
    cy.get("div[role='dialog']").should("be.visible")

    // Check file types from submitted Run form and Analysis form are Uniquely pre-filled in DOI form
    cy.get("input[data-testid='formats.0']", { timeout: 10000 }).should("have.value", "bam")
    cy.get("input[data-testid='formats.1']", { timeout: 10000 }).should("have.value", "cram")

    // Go to Creators section and Add new item
    cy.get("h2[data-testid='creators']").parents().children("button").click()
    cy.get("h3[data-testid='creators.0.affiliation']", { timeout: 10000 }).parent().children("button").click()
    // Type search words in autocomplete field
    cy.get("input[name='creators.0.affiliation.0.name']").type("csc")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    // Check the rest 3 fields are auto-filled and disabled
    cy.get("input[data-testid='creators.0.affiliation.0.schemeUri']").should("have.value", "https://ror.org")
    cy.get("input[data-testid='creators.0.affiliation.0.schemeUri']").should("be.disabled")

    cy.get("input[data-testid='creators.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/04m8m1253"
    )
    cy.get("input[data-testid='creators.0.affiliation.0.affiliationIdentifier").should("be.disabled")

    cy.get("input[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("have.value", "ROR")
    cy.get("input[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("be.disabled")

    // Go to Contributors and Add new item
    cy.get("h2[data-testid='contributors']").parents().children("button").click()
    cy.get("h3[data-testid='contributors.0.affiliation']", { timeout: 10000 }).parent().children("button").click()
    // Type search words in autocomplete field
    cy.get("input[name='contributors.0.affiliation.0.name']").type("demos")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    // Check the rest 3 fields are auto-filled and disabled
    cy.get("input[data-testid='contributors.0.affiliation.0.schemeUri").should("have.value", "https://ror.org")
    cy.get("input[data-testid='contributors.0.affiliation.0.schemeUri").should("be.disabled")

    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/032bmj362"
    )
    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should("be.disabled")

    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifierScheme']").should("have.value", "ROR")
    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifierScheme']").should("be.disabled")
  })
})
