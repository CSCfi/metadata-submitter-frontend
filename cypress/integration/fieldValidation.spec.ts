describe("Field validation", function () {
  beforeEach(() => {
    cy.login()
  })

  it("should translate AJV validation messages according to locale", () => {
    cy.get("#lang-selector").should("contain", "en")

    cy.get("button").contains("Create Submission").click()

    cy.get("input[name='name']").type("Test published folder")
    cy.get("textarea[name='description']").type("Test description")
    cy.get("button[type=button]").contains("Next").click()
    cy.wait(500)

    cy.clickFillForm("Sample")

    cy.get("input[name='sampleName.taxonId']").type("Test id").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "must be integer")

    cy.get("#lang-selector").click()
    cy.get("li[role=menuitem]").contains("Fi").click()

    cy.get("input[name='sampleName.taxonId']").type(" edit").blur()
    cy.get("p[id='sampleName.taxonId-helper-text']").should("have.text", "täytyy olla kokonaisluku")
  })
})

export {}
