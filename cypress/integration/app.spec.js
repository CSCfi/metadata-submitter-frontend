describe("Basic e2e", function () {
  it("should navigate to home with click of login button", () => {
    cy.visit("http://localhost:3000/")
    cy.get('[alt="CSC Login"]').click()
  })

  it("should create new folder", () => {
    cy.visit("http://localhost:3000/newdraft")

    // Navigate to folder creation
    cy.get("button[type=button]").contains("New folder").click()

    // Add folder name & description, navigate to submissions
    cy.get('input[name="name"]').type("Test name")
    cy.get('textarea[name="description"]').type("Test description")
    cy.get("button[type=button]").contains("Next").click()

    // Fill a study form and save object
    cy.get("div[role=button]").contains("Study").click()
    cy.get("div[role=button]").contains("Fill Form").click()
    cy.get('input[name="descriptor.studyTitle"]').type("Test title")
    cy.get('select[name="descriptor.studyType"]').select("Metagenomics")
    cy.get("button[type=submit]").contains("Save").click()

    // Navigate to summary and publish
    cy.get("button[type=button]").contains("Next").click()
    cy.get("button[type=button]").contains("Publish").click()
  })
})
