describe("render objects' links and attributes ", function () {
  const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

  it("should render correct Study Links and Attributes", () => {
    cy.visit(baseUrl)
    cy.get('[alt="CSC Login"]').click()
    cy.visit(baseUrl + "newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()
    // Add folder name & description, navigate to submissions
    cy.get("input[name='name']").type("Test name")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
    // Focus on the Study title input in the Study form (not type anything)
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()

    // Fill a Study form and submit object
    cy.get("input[name='descriptor.studyTitle']").type("Test title")
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test title")
    cy.get("select[name='descriptor.studyType']").select("Metagenomics")

    // Add new Study Link
    cy.get("div").contains("Study Links").parent().children("button").click()

    // Choose XRef Link
    cy.get("select[name='studyLinks[0]']").select("XRef Link")

    cy.get("input[name='studyLinks[0].xrefDb']").type("Test XRef Database")
    cy.get("input[name='studyLinks[0].xrefId']").type("Test XRef Database ID")
    cy.get("input[name='studyLinks[0].label']").type("Test XRef Label")

    // Add new URL Link
    cy.get("div").contains("Study Links").parent().children("button").click()
    cy.get("select[name='studyLinks[1]']").select("URL Link")

    cy.get("input[name='studyLinks[1].label']").type("Test URL Label")
    cy.get("input[name='studyLinks[1].url']").type("https://testlink.com")

    // Add new Entrez Link
    cy.get("div").contains("Study Links").parent().children("button").click()
    cy.get("select[name='studyLinks[2]']").select("Entrez Link")

    cy.get("select[name='studyLinks[2].entrezDb']").select("genome")
    cy.get("input[name='studyLinks[2].entrezId']").type("Test Entrez Database ID")
    cy.get("input[name='studyLinks[2].label']").type("Test Entrez Label")

    // Choose Study Attributes
    cy.get("div").contains("Study Attributes").parent().children("button").click()

    cy.get("input[name='studyAttributes[0].tag']").type("Test Attributes Tag")
    cy.get("textarea[name='studyAttributes[0].value']").type("Test Attributes Value")

    // Submit form
    cy.get("button[type=submit]").contains("Submit").click()
    cy.get(".MuiListItem-container", { timeout: 10000 }).should("have.length", 1)

    // Check submitted object has correnct rendering data
    cy.get("button[type=button]").contains("Edit").click()
    cy.get("input[name='descriptor.studyTitle']").should("have.value", "Test title")

    // Check XRef Link
    cy.get("select[name='studyLinks[0]']").should("have.value", "XRef Link")
    cy.get("input[name='studyLinks[0].xrefDb']").should("have.value", "Test XRef Database")
    cy.get("input[name='studyLinks[0].xrefId']").should("have.value", "Test XRef Database ID")
    cy.get("input[name='studyLinks[0].label']").should("have.value", "Test XRef Label")

    // Check URL Link
    cy.get("select[name='studyLinks[1]']").should("have.value", "URL Link")
    cy.get("input[name='studyLinks[1].label']").should("have.value", "Test URL Label")
    cy.get("input[name='studyLinks[1].url']").should("have.value", "https://testlink.com")

    // Check Entrez Link
    cy.get("select[name='studyLinks[2]']").should("have.value", "Entrez Link")
    cy.get("select[name='studyLinks[2].entrezDb']").should("have.value", "genome")
    cy.get("input[name='studyLinks[2].entrezId']").should("have.value", "Test Entrez Database ID")
    cy.get("input[name='studyLinks[2].label']").should("have.value", "Test Entrez Label")

    cy.get("input[name='studyAttributes[0].tag']").should("have.value", "Test Attributes Tag")
    cy.get("textarea[name='studyAttributes[0].value']").should("have.value", "Test Attributes Value")
  })
})
