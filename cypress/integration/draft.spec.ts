import { ObjectTypes } from "constants/wizardObject"

describe("Draft operations", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    // Add folder name & description, navigate to submissions
    cy.generateFolderAndObjects(ObjectTypes.dac)
    // // Edit newly created folder
    cy.contains("Edit").click({ force: true })
  })

  it("should create new folder, save, delete and continue draft", () => {
    cy.clickAccordionPanel("Study, DAC and Policy")
    // Fill a Policy form
    cy.clickAddObject("policy")

    cy.get("[data-testid=title]").type("Test title")

    // Save a draft
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 1)

    // Save another draft
    cy.formActions("New form")
    cy.get("[data-testid=title]").type("Test title 2")
    cy.formActions("Save as Draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 2)

    // Update draft, save from dialog
    cy.get("[data-testid=title]").type(" second save")
    cy.get("[data-testid='policy-objects-list']").find("li").first().click()
    cy.get("h2").contains("Would you like to save draft version of this form")
    cy.get("div[role=dialog]").contains("Save").click()
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 2)

    // Delete a draft
    cy.get("[data-testid='Draft-objects']")
      .find("li")
      .first()
      .within(() => {
        cy.get("[data-testid='Delete submission']").first().click()
      })
    cy.get("[data-testid='Draft-objects']").find("li", { timeout: 10000 }).should("have.length", 1)

    // Continue draft
    cy.continueLatestDraft(ObjectTypes.policy)

    cy.get("[data-testid=title]")
    // Clear
    cy.formActions("Clear form")
    // Fill
    cy.get("[data-testid=title]").should("have.value", "")
    cy.get("[data-testid=title]").type("New title")

    cy.get("[data-testid=title]", { timeout: 10000 }).should("have.value", "New title")
    cy.get("select[data-testid='dacRef.accessionId']").select(1)
    cy.get("button[type=button]").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    // Create a new form and save as draft
    cy.formActions("New form")
    cy.get("[data-testid=title]").should("contain.text", "")
    cy.get("[data-testid=title]").type("New title 2")
    cy.get("[data-testid=title]").should("have.value", "New title 2")
    cy.get("select[data-testid='dacRef.accessionId']").select(1)
    cy.formActions("Save as Draft")

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Check that there are 2 drafts saved in drafts list
    cy.get("ul[data-testid='Draft-objects']").find("li").should("have.length", 2)

    // Submit first form draft
    cy.continueLatestDraft(ObjectTypes.policy)
    cy.get("select[data-testid='policy']").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")
    cy.formActions("Submit")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Submitted with")
    cy.get("[data-testid='Form-objects']").find("li").should("have.length", 1)

    // Submit second form draft
    cy.get(`[data-testid='draft-${ObjectTypes.policy}-list-item']`).should("have.length", 1)
    // Re-query instead of continueLatestDraft -command since original query results in detached DOM element
    cy.get(`[data-testid='draft-${ObjectTypes.policy}-list-item']`).click()
    cy.get("select[data-testid='policy']").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")
    cy.formActions("Submit")
    // Check that there are 2 submitted objects
    cy.get("[data-testid='Form-objects']", { timeout: 10000 }).find("li").should("have.length", 2)

    // Drafts list should be unmounted
    cy.get("[data-testid='Draft-objects']").should("have.length", 0)
  })
})

export {}
