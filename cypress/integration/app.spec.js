describe("Basic e2e", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should navigate to home with click of login button", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
  })

  it("should create new folder, add Study form, upload Study XML file, add Analysis form and publish folder", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.visit(baseUrl + "newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a Study form and submit object
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("button[type=button]").contains("Clear form").click()
    cy.get("input[name='descriptor.studyTitle']").type("New title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Upload a Study xml file.
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

    // Saved objects list should have newly added item from Study object
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)

    // Fill an Analysis form and submit object
    cy.get("div[role=button]").contains("Analysis").click()
    cy.get("div[role=button]")
      .contains("Fill Form")
      .should("be.visible")
      .then($btn => $btn.click())

    cy.get("form").within(() => {
      // Experiment
      cy.get("input[name='experimentRef.accessionId']").type("Experiment Test Accession Id")
      cy.get("input[name='experimentRef.identifiers.submitterId.namespace']").type("Experiment Test Namespace")
      cy.get("input[name='experimentRef.identifiers.submitterId.value']").type("Experiment Test Value")

      // Study
      cy.get("input[name='studyRef.accessionId']").type("Study Test Accession Id")
      cy.get("input[name='studyRef.identifiers.submitterId.namespace']").type("Study Test Namespace")
      cy.get("input[name='studyRef.identifiers.submitterId.value']").type("Study Test Value")

      // Sample
      cy.get("input[name='sampleRef.accessionId']").type("Sample Test Accession Id")
      cy.get("input[name='sampleRef.identifiers.submitterId.namespace']").type("Sample Test Namespace")
      cy.get("input[name='sampleRef.identifiers.submitterId.value']").type("Sample Test Value")

      // Run
      cy.get("input[name='runRef.accessionId']").type("Run Test Accession Id")
      cy.get("input[name='runRef.identifiers.submitterId.namespace']").type("Run Test Namespace")
      cy.get("input[name='runRef.identifiers.submitterId.value']").type("Run Test Value")

      // Analysis
      cy.get("input[name='analysisRef.accessionId']").type("Analysis Test Accession Id")
      cy.get("input[name='analysisRef.identifiers.submitterId.namespace']").type("Analysis Test Namespace")
      cy.get("input[name='analysisRef.identifiers.submitterId.value']").type("Analysis Test Value")

      cy.get("h3")
        .contains("Reference Alignment")
        .parent("div.formSection")
        .within(() => {
          cy.get("button").contains("Add new item").click()
          cy.get("input[name='analysisType.referenceAlignment.sequence[0].accessionId']").type("Reference Accession Id")
        })

      cy.get("h3")
        .contains("Sequence Variation")
        .parent("div.formSection")
        .within(() => {
          cy.get("input[name='analysisType.sequenceVariation.assembly.standard.accessionId']").type(
            "Sequence Standard Accession Id"
          )
          cy.get("button").contains("Add new item").click()
          cy.get("input[name='analysisType.sequenceVariation.sequence[0].accessionId']").type(
            "Squence Sequence Accession Id"
          )
        })

      cy.get("h3")
        .contains("Processed Reads")
        .parent("div.formSection")
        .within(() => {
          cy.get("input[name='analysisType.processedReads.assembly.standard.accessionId']").type(
            "Processed Standard Accession Id"
          )
          cy.get("button").contains("Add new item").click()

          cy.get("input[name='analysisType.processedReads.sequence[0].accessionId']").type(
            "Processed Sequence Accession Id"
          )
        })
      cy.root().submit()
    })

    // Saved objects list should have newly added item from Analysis object
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Navigate to summary
    cy.get("button[type=button]").contains("Next").click()

    // Check the amount of submitted objects in each object type
    cy.get("h6").contains("Study").parent("div").children().eq(1).should("have.text", 2)
    cy.get("h6").contains("Analysis").parent("div").children().eq(1).should("have.text", 1)

    // Navigate to publish
    cy.get("button[type=button]").contains("Publish").click()
    cy.get('button[aria-label="Publish folder contents and move to frontpage"]').contains("Publish").click()
  })
})
