describe("render objects' links and attributes ", function () {
  it("should render correct Study Links and Attributes", () => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create Submission").click()

    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
    cy.wait(500)
    // Focus on the Study title input in the Study form (not type anything)
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()

    // Fill a Study form and submit object
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Add new Study Link
    cy.get("div").contains("Study Links").parents().children("button").click()

    // Choose XRef Link
    cy.get("select[name='studyLinks.0']").select("XRef Link")

    cy.get("input[name='studyLinks.0.xrefDb']").type("Test XRef Database")
    cy.get("input[name='studyLinks.0.xrefId']").type("Test XRef Database ID")
    cy.get("input[name='studyLinks.0.label']").type("Test XRef Label")

    // URL Links
    cy.get("div").contains("Study Links").parents().children("button").click()
    cy.get("select[name='studyLinks.1']").select("URL Link")
    cy.get("input[name='studyLinks.1.label']").type("Test URL Label")

    // Add new invalid URL Link (form array, one of)
    cy.get("input[name='studyLinks.1.url']").type("testlink.com").blur()
    cy.get("p[id='studyLinks.1.url-helper-text']").contains("must match pattern")

    // Add new valid URL Link
    cy.get("input[name='studyLinks.1.url']").clear().type("https://testlink.com").blur()

    // Add new Entrez Link
    cy.get("div").contains("Study Links").parents().children("button").click()
    cy.get("select[name='studyLinks.2']").select("Entrez Link")

    cy.get("select[name='studyLinks.2.entrezDb']").select("genome")
    cy.get("input[name='studyLinks.2.entrezId']").type("Test Entrez Database ID")
    cy.get("input[name='studyLinks.2.label']").type("Test Entrez Label")

    // Choose Study Attributes
    cy.get("div").contains("Study Attributes").parents().children("button").click()

    cy.get("input[name='studyAttributes.0.tag']").type("Test Attributes Tag")
    cy.get("textarea[name='studyAttributes.0.value']").type("Test Attributes Value")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Check submitted object has correnct rendering data
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test title")

    // Check XRef Link
    cy.get("select[name='studyLinks.0']").should("have.value", "XRef Link")
    cy.get("input[name='studyLinks.0.xrefDb']").should("have.value", "Test XRef Database")
    cy.get("input[name='studyLinks.0.xrefId']").should("have.value", "Test XRef Database ID")
    cy.get("input[name='studyLinks.0.label']").should("have.value", "Test XRef Label")

    // Check URL Link
    cy.get("select[name='studyLinks.1']").should("have.value", "URL Link")
    cy.get("input[name='studyLinks.1.label']").should("have.value", "Test URL Label")
    cy.get("input[name='studyLinks.1.url']").should("have.value", "https://testlink.com")

    // Check Entrez Link
    cy.get("select[name='studyLinks.2']").should("have.value", "Entrez Link")
    cy.get("select[name='studyLinks.2.entrezDb']").should("have.value", "genome")
    cy.get("input[name='studyLinks.2.entrezId']").should("have.value", "Test Entrez Database ID")
    cy.get("input[name='studyLinks.2.label']").should("have.value", "Test Entrez Label")

    cy.get("input[name='studyAttributes.0.tag']").should("have.value", "Test Attributes Tag")
    cy.get("textarea[name='studyAttributes.0.value']").should("have.value", "Test Attributes Value")

    cy.get("div[class='arrayRow']", { timeout: 10000 }).should("have.length", 3)
    // Remove URL Link and check that the rest of the Study Links render correctly
    cy.get("div[data-testid='studyLinks[1]']").children("button").click({ force: true })
    cy.get("div[class='arrayRow']", { timeout: 10000 }).should("have.length", 2)

    cy.get("select[name='studyLinks.0']").should("have.value", "XRef Link")
    cy.get("select[name='studyLinks.1']").should("have.value", "Entrez Link")
  })
})

export {}
