import { ObjectTypes } from "constants/wizardObject"

describe("Draft operations", function () {
  beforeEach(() => {
    cy.task("resetDb")
    cy.login()

    // Add submission name & description, navigate to submissions
    cy.generateSubmissionAndObjects(ObjectTypes.dac)
    // // Edit newly created submission
    cy.contains("Edit").click({ force: true })
  })

  it("should create new submission, save, delete and continue draft", () => {
    cy.clickAccordionPanel("Study, DAC and Policy")
    // Fill a Policy form
    cy.clickAddObject("policy")

    cy.get("[data-testid=title]").type("Test title")

    // Save a draft
    cy.formActions("Save as draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 1)

    // Save another draft
    cy.get("button").contains("Add policy").click()
    cy.get("[data-testid=title]").should("have.value", "")
    cy.get("[data-testid=title]").type("Test title 2")
    cy.formActions("Save as draft")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 2)

    // Update draft, save from dialog
    cy.get("[data-testid=title]").type(" second save")
    cy.get("[data-testid='policy-objects-list']").find("a").first().click()
    cy.get("h2").contains("Would you like to save draft version of this form")
    cy.get("div[role=dialog]").contains("Save").click()
    cy.get("div[role=dialog]", { timeout: 10000 }).should("not.exist")
    cy.get("[data-testid='policy-objects-list']").find("li").should("have.length", 2)

    // Continue first draft
    cy.get("[data-testid='draft-policy-list-item']", { timeout: 10000 }).first().click({ force: true })

    // Clear form
    cy.optionsActions("Clear form")
    // Fill
    cy.get("[data-testid=title]").should("have.value", "")
    cy.get("[data-testid=title]").type("New title")

    cy.get("[data-testid=title]", { timeout: 10000 }).should("have.value", "New title")
    cy.get("select[data-testid='dacRef.accessionId']").select(1)
    cy.get("button[type=button]").contains("Update draft").click()
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft updated with")

    // Create a new form and save as draft
    cy.get("button").contains("Add DAC").click()
    cy.get("[data-testid=title]").should("contain.text", "")
    cy.get("[data-testid=title]").type("New title 2")
    cy.get("[data-testid=title]").should("have.value", "New title 2")
    cy.formActions("Save as draft")

    cy.get("div[role=alert]", { timeout: 10000 }).contains("Draft saved with")

    // Check that there are 2 drafts saved in drafts list
    cy.get("ul[data-testid='dac-objects-list']").find("li").should("have.length", 2)

    // Submit first form draft
    cy.continueLatestDraft(ObjectTypes.policy)
    cy.get("select[data-testid='dacRef.accessionId']").select(1)
    cy.get("select[data-testid='policy']").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")
    cy.formActions("Mark as ready")
    cy.get("div[role=alert]", { timeout: 10000 }).contains("Submitted with")

    // Submit second form draft
    // Re-query instead of continueLatestDraft -command since original query results in detached DOM element
    cy.get(`[data-testid='draft-${ObjectTypes.policy}-list-item']`).first().click({ force: true })
    cy.get("select[data-testid='policy']", { timeout: 10000 }).should("be.visible").select("Policy Text")
    cy.get("textarea[data-testid='policy.policyText']").type("Test policy text")
    cy.formActions("Mark as ready")
    // Check that there are 2 submitted objects
    cy.get("[data-testid='policy-objects-list']", { timeout: 10000 }).find("li").should("have.length", 2)
  })
})

export {}
