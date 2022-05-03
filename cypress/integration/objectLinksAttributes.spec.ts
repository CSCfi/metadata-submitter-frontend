import { ObjectTypes } from "constants/wizardObject"

describe("render objects' links and attributes ", function () {
  beforeEach(() => {
    cy.task("resetDb")
  })
  it("should render correct Study Links and Attributes", () => {
    cy.login()

    cy.get("button", { timeout: 10000 }).contains("Create submission").click()

    // Add folder name & description, navigate to submissions
    cy.newSubmission()

    // Fill a Study form and submit object
    cy.get("[data-testid='descriptor.studyTitle']").type("Test title")
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Test title")
    cy.get("select[data-testid='descriptor.studyType']").select("Metagenomics")
    cy.get("[data-testid='descriptor.studyAbstract']").type("Test abstract")

    // Add new Study Link
    cy.get("div").contains("Study Links").parents().children("button").click()

    // Choose XRef Link
    cy.get("select[data-testid='studyLinks.0']").select("XRef Link")

    cy.get("[data-testid='studyLinks.0.xrefDb']").type("Test XRef Database")
    cy.get("[data-testid='studyLinks.0.xrefId']").type("Test XRef Database ID")
    cy.get("[data-testid='studyLinks.0.label']").type("Test XRef Label")

    // URL Links
    cy.get("div").contains("Study Links").parents().children("button").click()
    cy.get("select[data-testid='studyLinks.1']").select("URL Link")
    cy.get("[data-testid='studyLinks.1.label']").type("Test URL Label")

    // Add new invalid URL Link (form array, one of)
    cy.get("[data-testid='studyLinks.1.url']").type("testlink.com").blur()
    cy.get("p[id='studyLinks.1.url-helper-text']").contains("must match pattern")

    // Add new valid URL Link
    cy.get("[data-testid='studyLinks.1.url']").clear().type("https://testlink.com").blur()

    // Add new Entrez Link
    cy.get("div").contains("Study Links").parents().children("button").click()
    cy.get("select[data-testid='studyLinks.2']").select("Entrez Link")

    cy.get("select[data-testid='studyLinks.2.entrezDb']").select("genome")
    cy.get("[data-testid='studyLinks.2.entrezId']").type("Test Entrez Database ID")
    cy.get("[data-testid='studyLinks.2.label']").type("Test Entrez Label")

    // Choose Study Attributes
    cy.get("div").contains("Study Attributes").parents().children("button").click()

    cy.get("[data-testid='studyAttributes.0.tag']").type("Test Attributes Tag")
    cy.get("[data-testid='studyAttributes.0.value']").type("Test Attributes Value")

    // Save as draft
    cy.formActions("Save as Draft")
    cy.get("[data-testid='study-objects-list']").find("li").should("have.length", 1)

    // Check submitted object has correnct rendering data
    cy.continueLatestDraft(ObjectTypes.study)
    cy.get("[data-testid='descriptor.studyTitle']").should("have.value", "Test title")

    // Check XRef Link
    cy.get("select[data-testid='studyLinks.0']").should("have.value", "XRef Link")
    cy.get("[data-testid='studyLinks.0.xrefDb']").should("have.value", "Test XRef Database")
    cy.get("[data-testid='studyLinks.0.xrefId']").should("have.value", "Test XRef Database ID")
    cy.get("[data-testid='studyLinks.0.label']").should("have.value", "Test XRef Label")

    // Check URL Link
    cy.get("select[data-testid='studyLinks.1']").should("have.value", "URL Link")
    cy.get("[data-testid='studyLinks.1.label']").should("have.value", "Test URL Label")
    cy.get("[data-testid='studyLinks.1.url']").should("have.value", "https://testlink.com")

    // Check Entrez Link
    cy.get("select[data-testid='studyLinks.2']").should("have.value", "Entrez Link")
    cy.get("select[data-testid='studyLinks.2.entrezDb']").should("have.value", "genome")
    cy.get("[data-testid='studyLinks.2.entrezId']").should("have.value", "Test Entrez Database ID")
    cy.get("[data-testid='studyLinks.2.label']").should("have.value", "Test Entrez Label")

    cy.get("[data-testid='studyAttributes.0.tag']").should("have.value", "Test Attributes Tag")
    cy.get("[data-testid='studyAttributes.0.value']").should("have.value", "Test Attributes Value")

    cy.get("div[data-testid='studyLinks'] > div", { timeout: 10000 }).should("have.length", 3)
    // Remove URL Link and check that the rest of the Study Links render correctly
    cy.wait(0)
    cy.get("[data-testid='studyLinks[1]'] > button", { timeout: 10000 }).should("be.visible").click()

    cy.get("div[data-testid='studyLinks'] > div", { timeout: 30000 }).should("have.length", 2)

    cy.get("select[data-testid='studyLinks.0']").should("have.value", "XRef Link")
    cy.get("select[data-testid='studyLinks.1']").should("have.value", "Entrez Link")

    // Test that removed link item is removed also from backend
    cy.formActions("Update")
    cy.continueLatestDraft(ObjectTypes.study)
    cy.get("div[data-testid='studyLinks'] > div", { timeout: 30000 }).should("have.length", 2)
  })
})

export {}
