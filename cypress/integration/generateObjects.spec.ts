import { ObjectTypes } from "constants/wizardObject"

describe("Generate objects", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()
  })

  it("should generate objects from templates and publish", () => {
    cy.generateFolderAndObjects()
    // Edit newly created folder
    cy.contains("Edit").click({ force: true })

    cy.clickAccordionPanel("publish")

    cy.get("button[role=button]", { timeout: 10000 }).contains("Publish").click()

    // Check the amount of submitted objects in each object type
    cy.get("h6").contains("Study").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("DAC").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Policy").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Sample").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Experiment").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Run").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Analysis").parents("div").children().eq(1).should("have.text", 1)
    cy.get("h6").contains("Dataset").parents("div").children().eq(1).should("have.text", 1)

    // Fill and save DOI form
    cy.saveDoiForm()

    // Publish folder and test that folder is listed in published folders tab
    cy.get("button[data-testid='summary-publish']").contains("Publish").click()
    cy.get("[data-testid='alert-dialog-content']").should("have.text", "Objects in this folder will be published.")
    cy.get('[data-testid="confirm-publish-folder"]').contains("Publish").click()

    cy.get("[data-testid='published-tab']").click()
    cy.get("[data-field='name']").eq(1).invoke("text").should("eq", "Test generated folder")
  })

  it("should generate objects and stop in specific object type", () => {
    cy.generateFolderAndObjects(ObjectTypes.dac)
    // // Edit newly created folder
    cy.contains("Edit").click({ force: true })

    // Open 2nd step and test that last generated object type is DAC
    cy.clickAccordionPanel("Study, DAC and Policy")
    cy.get("[data-testid='study-objects-list']").find("li").should("have.length", 1)
    cy.get("[data-testid='dac-objects-list']").find("li").should("have.length", 1)
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 0)
  })
})

export {}
