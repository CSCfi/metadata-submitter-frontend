describe("Basic e2e", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should navigate to home with click of login button", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
  })

  it("should create new folder, add Study form, upload Study XML file, add Analysis form, and publish folder", () => {
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

    // Skip-link
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").type("{enter}")
    cy.get("div[role=button]").contains("Skip to form")

    // Fill a Study form and submit object
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("button[type=button]").contains("Clear form").click()
    cy.get("input[name='descriptor.studyTitle']").type("New title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Clear form
    cy.get("button[type=button]").contains("Clear").click()

    // Edit saved submission
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title")
    cy.get("input[name='descriptor.studyTitle']", { timeout: 10000 }).focus().type(" edited").blur()
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title edited")
    cy.get("button[type=button]").contains("Update").click()
    cy.get("div[role=alert]").contains("Object updated")
    cy.get("button[type=button]").contains("New form").click()
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "New title edited")

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

    // Replace XML
    cy.get("button[type=button]").contains("Replace").click()
    cy.get(".MuiCardHeader-action").contains("Replace")
    cy.fixture("study_test_modified.xml").then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: "testFile_replace.xml",
        mimeType: "text/xml",
        force: true,
      })
    })
    cy.get("form").submit()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 2)
    cy.contains(".MuiAlert-message", "Object replaced")

    // Fill an Analysis form and submit object
    cy.get("div[role=button]").contains("Analysis").click()
    cy.get("div[role=button]")
      .contains("Fill Form")
      .should("be.visible")
      .then($btn => $btn.click())

    cy.get("form").within(() => {
      cy.get("input[name='title']").type("Test title")

      // Analysis type
      cy.get("select[name='analysisType']").select("Reference Alignment")
      cy.get("select[name='analysisType.referenceAlignment.assembly']").select("Standard")
      cy.get("input[name='analysisType.referenceAlignment.assembly.accessionId']").type("Standard Accession Id")
      cy.get("h4").contains("Sequence").parent().children("button").click()
      cy.get("input[name='analysisType.referenceAlignment.sequence[0].accessionId']").type(
        "Sequence Standard Accession Id"
      )

      // Experiment
      cy.get("h2").contains("Experiment Reference").parent().children("button").click()
      cy.get("input[name='experimentRef[0].accessionId']").type("Experiment Test Accession Id")
      cy.get("input[name='experimentRef[0].identifiers.submitterId.namespace']").type("Experiment Test Namespace")
      cy.get("input[name='experimentRef[0].identifiers.submitterId.value']").type("Experiment Test Value")

      // Study
      cy.get("input[name='studyRef.identifiers.submitterId.namespace']").type("Study Test Namespace")
      cy.get("input[name='studyRef.identifiers.submitterId.value']").type("Study Test Value")

      // Sample
      cy.get("h2").contains("Sample Reference").parent().children("button").click()
      cy.get("input[name='sampleRef[0].accessionId']").type("Sample Test Accession Id")
      cy.get("input[name='sampleRef[0].identifiers.submitterId.namespace']").type("Sample Test Namespace")
      cy.get("input[name='sampleRef[0].identifiers.submitterId.value']").type("Sample Test Value")

      // Run
      cy.get("h2").contains("Run Reference").parent().children("button").click()
      cy.get("input[name='runRef[0].accessionId']").type("Run Test Accession Id")
      cy.get("input[name='runRef[0].identifiers.submitterId.namespace']").type("Run Test Namespace")
      cy.get("input[name='runRef[0].identifiers.submitterId.value']").type("Run Test Value")

      // Analysis
      cy.get("h2").contains("Analysis Reference").parent().children("button").click()
      cy.get("input[name='analysisRef[0].accessionId']").type("Analysis Test Accession Id")
      cy.get("input[name='analysisRef[0].identifiers.submitterId.namespace']").type("Analysis Test Namespace")
      cy.get("input[name='analysisRef[0].identifiers.submitterId.value']").type("Analysis Test Value")

      // Files
      cy.get("h2").contains("Files").parent().children("button").click()
      cy.get("input[name='files[0].filename']").type("filename 1")
      cy.get("select[name='files[0].filetype']").select("other")
      cy.get("select[name='files[0].checksumMethod']").select("MD5")
      cy.get("input[name='files[0].checksum']").type("b1f4f9a523e36fd969f4573e25af4540")

      cy.get("h2").contains("Files").parent().children("button").click()
      cy.get("input[name='files[1].filename']").type("filename 2")
      cy.get("select[name='files[1].filetype']").select("info")
      cy.get("select[name='files[1].checksumMethod']").select("SHA-256")
      cy.get("input[name='files[1].checksum']").type("c34045c1a1db8d1b3fca8a692198466952daae07eaf6104b4c87ed3b55b6af1b")
    })
    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
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
