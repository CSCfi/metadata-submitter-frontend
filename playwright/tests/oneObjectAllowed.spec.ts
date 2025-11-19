import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { FEGAObjectTypes } from "constants/wizardObject"

test.describe("One draft or submitted object is allowed", () => {
  test.beforeEach(async ({ login, resetDB, newSubmission }) => {
    await resetDB()
    await login()

    // Add submission name & description
    await newSubmission()
  })

  test("should be able to save only one draft or submit one version for Study", async ({
    page,
    clickAddObject,
    formActions,
  }) => {
    test.slow()

    // Add Study form
    await clickAddObject(FEGAObjectTypes.study)
    await page.getByTestId("descriptor.studyTitle").fill("Test study")
    await page.getByTestId("descriptor.studyType").selectOption("Epigenetics")
    await page.getByTestId("descriptor.studyAbstract").fill("Study abstract")

    // Save Study as draft
    await formActions("form-draft")
    await page.getByRole("alert").filter({ hasText: "Draft saved successfully" })
    await expect(page.getByTestId("draft-study-list-item")).toHaveCount(1)
    // Assert that button "Save as draft" should be changed to "Update draft"
    await expect(page.getByTestId("form-draft")).toHaveText("Update draft")

    // Update Study draft
    await page.getByTestId("descriptor.studyTitle").fill("Test study 2")
    await formActions("form-draft")
    await page.getByRole("alert").filter({ hasText: "Draft saved successfully" })
    // Assert that the Study draft is saved again with new title, no new draft is created
    await expect(page.getByTestId("draft-study-list-item")).toHaveCount(1)
    await expect(page.getByTestId("draft-study-list-item")).toHaveText("Test study 2")

    // Mark Study as ready
    await formActions("form-ready")
    await page.getByRole("alert").filter({ hasText: "Submitted successfully" })
    /* Assert that "Save as draft" and "Mark as ready" button are now disabled because there is one Study object submitted,
     * user cannot Add a new study
     */
    await expect(page.getByTestId("form-draft")).toBeDisabled()
    await expect(page.getByTestId("Add study")).toBeDisabled()

    // Click the submitted Study to edit, assert that user can only "Update" the submitted Study
    await page.getByTestId("draft-study-list-item").click()
    await expect(await page.getByTestId("form-ready")).toHaveText("Update")
  })
})

export {}
