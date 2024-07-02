import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Test workflow selection", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB()
  })
  test("checks that workflow selection is disabled after it's saved", async ({
    page,
    login,
    newSubmission,
    checkWorkflowRadios,
  }) => {
    test.slow()
    await login()
    await page.getByTestId("link-create-submission").click()

    // Add submission name, description, select workflow, save
    await newSubmission()

    // Check that we moved to step 2
    await expect(page.getByTestId("descriptor.studyTitle")).toBeVisible()

    // Go back to step 1 and check that workflow selection is disabled
    await page
      .locator("[data-testid='1-step-enabled']")
      .getByRole("button", { name: "Submission details" })
      .click()
    await page.getByTestId("submitted-submissionDetails-list-item").click()
    await checkWorkflowRadios("SDSX")

    // Save submission and return to homepage
    await page.getByTestId("save-submission").click()
    await page
      .getByRole("dialog")
      .getByText(/Save and exit/i)
      .click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 })

    // Re-open submission and check that workflow selection is disabled
    await page
      .locator("[role='row']", {
        has: page.getByText("Test submission name"),
      })
      .locator("[data-testid='edit-draft-submission']")
      .click()
    await checkWorkflowRadios("SDSX")
  })
})

export {}
