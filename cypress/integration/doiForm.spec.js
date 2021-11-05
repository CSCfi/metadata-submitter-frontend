describe("DOI form", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    cy.wait(500)
  })
  it("should render DOI form correctly with formats' prefilled values and affiliation's autocomplete field", () => {
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

    // Remove Creators > Affiliations field and add a new field again
    cy.get("div[data-testid='creators.0.affiliation']").children("button").click()
    cy.get("h3[data-testid='creators.0.affiliation']").parent().children("button").click()

    // Repeat search words in autocomplete field
    cy.get("input[name='creators.0.affiliation.0.name']").type("csc")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())

    // Check the rest 3 fields are auto-filled and disabled as they should be
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

    // Delete the autocompleteField value and check the field <affiliationIdentifier> also removed
    cy.get("input[name='contributors.0.affiliation.0.name']")
      .parent()
      .children("div[class='MuiAutocomplete-endAdornment']")
      .click()
    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifier']").should("have.value", "")

    // Type new search words
    cy.get("input[name='contributors.0.affiliation.0.name']").type("test")
    // Select the first result and check the <affiliationIdentifier> field is filled and disabled
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/03fknzz27"
    )
    cy.get("input[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should("be.disabled")
  }),
    it("should fill the required fields and save DOI form successfully", () => {
      // Go to DOI form
      cy.get("button[type=button]").contains("Next").click()
      cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
      cy.get("div[role='dialog']").should("be.visible")

      // Fill in required Creators field
      cy.get("h2[data-testid='creators']").parent().children("button").click()
      cy.get("input[data-testid='creators.0.givenName']").type("John Smith")

      // Fill in required Subjects field
      cy.get("h2[data-testid='subjects']").parent().children("button").click()
      cy.get("select[name='subjects.0.subject']").select("FOS: Mathematics")

      cy.get("button[type='submit']").click()
      cy.contains(".MuiAlert-message", "DOI form has been saved successfully")

      // Open the DOI form again and check the fields render correctly
      cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
      cy.get("input[data-testid='creators.0.givenName']").should("have.value", "John Smith")
      cy.get("select[name='subjects.0.subject']").should("have.value", "FOS: Mathematics")
    })
})