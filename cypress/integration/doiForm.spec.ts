describe("DOI form", function () {
  beforeEach(() => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()
  })
  it("should render DOI form correctly with formats' prefilled values and affiliation's autocomplete field", () => {
    // Fill in Run form
    cy.clickFillForm("Run")

    const testRunData = {
      title: "Test Run",
      experimentRefLabel: "Test Experiment reference label",
    }

    cy.get("[data-testid='title']").type(testRunData.title)
    cy.get("[data-testid='experimentRef']").parents().children("button").click()
    cy.get("[data-testid='experimentRef.0.label']").type(testRunData.experimentRefLabel)

    const testRunFile = {
      fileName: "Run file name",
      fileType: "bam",
      checksumMethod: "MD5",
      checksum: "Run file check sum",
    }
    cy.get("[data-testid='files']").parents().children("button").click()
    cy.get("[data-testid='files.0.filename']").type(testRunFile.fileName)
    cy.get("[data-testid='files.0.filetype']").select(testRunFile.fileType)
    cy.get("[data-testid='files.0.checksumMethod']").select(testRunFile.checksumMethod)
    cy.get("[data-testid='files.0.checksum']").type(testRunFile.checksum)

    // Submit form
    cy.formActions("Submit")

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

    cy.get("[data-testid='title']").type(testAnalysisData.title1)
    cy.get("[data-testid='analysisType']").select("Reference Alignment")
    cy.get("[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("[data-testid='analysisType.referenceAlignment.assembly.accessionId']").type("Standard Accession Id")

    const testAnalysisFile = {
      fileName: "Analysis file name",
      fileType1: "cram",
      fileType2: "bam",
      checksumMethod: "SHA-256",
      checksum: "Analysis file check sum",
    }
    // Select fileType
    cy.get("[data-testid='files']").parents().children("button").click()
    cy.get("[data-testid='files.0.filename']").type(testAnalysisFile.fileName)
    cy.get("[data-testid='files.0.filetype']").select(testAnalysisFile.fileType1)
    cy.get("[data-testid='files.0.checksumMethod']").select(testAnalysisFile.checksumMethod)
    cy.get("[data-testid='files.0.checksum']").type(testAnalysisFile.checksum)

    // Submit form
    cy.formActions("Submit")

    // Submitted objects list should have newly added item from Run form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Fill another Analysis form with the same fileType as Run form: "bam"
    cy.formActions("New form")
    cy.get("[data-testid='title']").type(testAnalysisData.title2)
    cy.get("[data-testid='analysisType']").select("Reference Alignment")
    cy.get("[data-testid='analysisType.referenceAlignment.assembly']").select("Standard")
    cy.get("[data-testid='analysisType.referenceAlignment.assembly.accessionId']").type("Standard Accession Id")
    // Select fileType
    cy.get("[data-testid='files.0.filename']").type(testAnalysisFile.fileName)
    cy.get("[data-testid='files.0.filetype']").select(testAnalysisFile.fileType2)
    cy.get("[data-testid='files.0.checksumMethod']").select(testAnalysisFile.checksumMethod)
    cy.get("[data-testid='files.0.checksum']").type(testAnalysisFile.checksum)

    // Submit form
    cy.formActions("Submit")

    // Submitted objects list should have newly added item from Run form
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Go to DOI form
    cy.openDOIForm()

    // Check file types from submitted Run form and Analysis form are Uniquely pre-filled in DOI form
    cy.get("[data-testid='formats.0']", { timeout: 10000 }).should("have.value", "bam")
    cy.get("[data-testid='formats.1']", { timeout: 10000 }).should("have.value", "cram")

    // Go to Creators section and Add new item
    cy.get("[data-testid='creators']").parents().children("button").click()
    cy.get("[data-testid='creators.0.affiliation']", { timeout: 10000 }).parent().children("button").click()

    // Type search words in autocomplete field
    cy.intercept("/organizations*").as("searchOrganization")
    cy.get("[data-testid='creators.0.affiliation.0.name-inputField']").type("csc")
    cy.wait("@searchOrganization")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    // Check the rest 3 fields are auto-filled and disabled
    cy.get("[data-testid='creators.0.affiliation.0.schemeUri']").should("have.value", "https://ror.org")
    cy.get("[data-testid='creators.0.affiliation.0.schemeUri']").should("be.disabled")

    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/04m8m1253"
    )
    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifier").should("be.disabled")

    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("have.value", "ROR")
    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("be.disabled")

    // Remove Creators > Affiliations field and add a new field again
    cy.get("div[data-testid='creators.0.affiliation'] > div").children("button").click()
    cy.get("h3[data-testid='creators.0.affiliation']").parent().children("button").click()

    // Repeat search words in autocomplete field
    cy.get("[data-testid='creators.0.affiliation.0.name-inputField']").type("csc")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())

    // Check the rest 3 fields are auto-filled and disabled as they should be
    cy.get("[data-testid='creators.0.affiliation.0.schemeUri']").should("have.value", "https://ror.org")
    cy.get("[data-testid='creators.0.affiliation.0.schemeUri']").should("be.disabled")

    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/04m8m1253"
    )
    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifier").should("be.disabled")

    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("have.value", "ROR")
    cy.get("[data-testid='creators.0.affiliation.0.affiliationIdentifierScheme']").should("be.disabled")

    // Go to Contributors and Add new item
    cy.get("[data-testid='contributors']").parents().children("button").click()
    cy.get("[data-testid='contributors.0.affiliation']", { timeout: 10000 }).parent().children("button").click()
    // Type search words in autocomplete field
    cy.get("[data-testid='contributors.0.affiliation.0.name-inputField']").type("demos")
    // Select the first result
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    // Check the rest 3 fields are auto-filled and disabled
    cy.get("[data-testid='contributors.0.affiliation.0.schemeUri").should("have.value", "https://ror.org")
    cy.get("[data-testid='contributors.0.affiliation.0.schemeUri").should("be.disabled")

    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/032bmj362"
    )
    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should("be.disabled")

    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifierScheme']").should("have.value", "ROR")
    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifierScheme']").should("be.disabled")

    // Delete the autocompleteField value and check the field <affiliationIdentifier> also removed
    cy.get("[data-testid='contributors.0.affiliation.0.name-inputField']").parent().children("div").click()
    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifier']").should("have.value", "")

    // Type new search words
    cy.get("[data-testid='contributors.0.affiliation.0.name-inputField']").type("test")
    // Select the first result and check the <affiliationIdentifier> field is filled and disabled
    cy.get(".MuiAutocomplete-option")
      .should("be.visible")
      .then($el => $el.first().click())
    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should(
      "have.value",
      "https://ror.org/03fknzz27"
    )
    cy.get("[data-testid='contributors.0.affiliation.0.affiliationIdentifier").should("be.disabled")
  }),
    it("should fill the required fields and save DOI form successfully", () => {
      // Go to DOI form
      cy.openDOIForm()

      // Fill in required Creators field
      cy.get("[data-testid='creators']").parent().children("button").click()
      cy.get("[data-testid='creators.0.givenName']").type("John Smith")

      // Fill in required Subjects field
      cy.get("[data-testid='subjects']").parent().children("button").click()
      cy.get("select[data-testid='subjects.0.subject']").select("FOS: Mathematics")

      cy.get("button[type='submit']").click()
      cy.contains(".MuiAlert-message", "DOI form has been saved successfully")

      // Open the DOI form again and check the fields render correctly
      cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
      cy.get("[data-testid='creators.0.givenName']").should("have.value", "John Smith")
      cy.get("select[data-testid='subjects.0.subject']").should("have.value", "FOS: Mathematics")
    }),
    it("should autofill full name based on family and given name", () => {
      // Go to DOI form
      cy.openDOIForm()
      // Go to Creators section and fill in given name, family name
      cy.get("[data-testid='creators']").parents().children("button").click()
      cy.get("[data-testid='creators.0.givenName']").type("Creator's given name")
      cy.get("[data-testid='creators.0.familyName']").type("Creator's family name")
      // Check full name is autofilled from family name and given name
      cy.get("[data-testid='creators.0.name']").should("have.value", "Creator's family name,Creator's given name")

      // Go to Contributors and fill in given name, family name
      cy.get("[data-testid='contributors']").parents().children("button").click()
      cy.get("[data-testid='contributors.0.givenName']").type("Contributor's given name")
      cy.get("[data-testid='contributors.0.familyName']").type("Contributor's family name")
      // Check full name is autofilled from family name and given name
      cy.get("[data-testid='contributors.0.name']").should(
        "have.value",
        "Contributor's family name,Contributor's given name"
      )
    })
  it("should fill in the required fields, Dates fields and save DOI form successfully", () => {
    // Go to DOI form
    cy.openDOIForm()

    // Fill in required Creators field
    cy.get("[data-testid='creators']").parent().children("button").click()
    cy.get("[data-testid='creators.0.givenName']").type("Test given name")

    // Fill in required Subjects field
    cy.get("[data-testid='subjects']").parent().children("button").click()
    cy.get("[data-testid='subjects.0.subject']").select("FOS: Mathematics")

    // Select Dates
    cy.get("[data-testid='dates']").parent().children("button").click()

    cy.get("[data-testid='dates.0.date']").scrollIntoView()
    cy.get("[data-testid='dates.0.date']").should("be.visible")
    // Set a constant Date in advance so the calendar will open to certain date
    cy.clock(new Date(2021, 9, 1), ["Date"])

    cy.get("[data-testid='Start']")
      .scrollIntoView({ offset: { left: 0, top: -100 } })
      .should("be.visible")

    cy.wait(500)
    cy.get("[data-testid='Start'] > div")
      .should("be.visible")
      .then(() => cy.get("[data-testid='Start'] > div > button").click({ force: true }))
    cy.get("div").contains("4", { timeout: 10000 }).click()
    cy.get("[data-testid='dates.0.date']").should("have.value", "2021-10-04/")

    cy.get("[data-testid='End'] > div > button").click()
    cy.get("div").contains("23", { timeout: 10000 }).click()
    cy.get("[data-testid='dates.0.date']").should("have.value", "2021-10-04/2021-10-23")

    cy.get("[data-testid='startDateCheck']").click()
    cy.get("[data-testid='dates.0.date']").should("have.value", "/2021-10-23")
    cy.get("[data-testid='Start'] > div > button").should("be.disabled")

    cy.get("[data-testid='startDateCheck']").click()
    cy.get("[data-testid='Start'] > div > button").click()
    cy.get("div").contains("10", { timeout: 10000 }).click()
    cy.get("[data-testid='dates.0.date']").should("have.value", "2021-10-10/2021-10-23")

    cy.get("[data-testid='endDateCheck']").click()
    cy.get("[data-testid='dates.0.date']").should("have.value", "2021-10-10/")
    cy.get("[data-testid='End'] > div > button").should("be.disabled")

    // Select Date Type
    cy.get("select[data-testid='dates.0.dateType']").select("Valid")

    cy.get("button[type='submit']").click()
    cy.contains(".MuiAlert-message", "DOI form has been saved successfully")
  })
})

export {}
