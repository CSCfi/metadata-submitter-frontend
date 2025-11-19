import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { FEGAObjectTypes, ObjectStatus } from "constants/wizardObject"

test.describe("Deleting Form", () => {
  test.beforeEach(async ({ login, resetDB, newSubmission }) => {
    await resetDB()
    await login()

    // Add submission name & description
    await newSubmission()
  })

  test("should be able to delete from in Submitted state", async ({
    page,
    clickAddObject,
    formActions,
    continueLatestForm,
  }) => {
    test.slow()

    // Add Study form
    await clickAddObject(FEGAObjectTypes.study)
    await page.getByTestId("descriptor.studyTitle").fill("Test study")
    await page.getByTestId("descriptor.studyType").selectOption("Epigenetics")
    await page.getByTestId("descriptor.studyAbstract").fill("Study abstract")

    // Mark as ready
    await formActions("form-ready")

    await expect(page.getByTestId("submitted-study-list-item")).toHaveCount(1)

    // Reopen submitted Study form
    await continueLatestForm(FEGAObjectTypes.study, ObjectStatus.submitted)
    await expect(page.getByTestId("descriptor.studyTitle")).toHaveValue("Test study")
    await page.getByTestId("MoreHorizIcon").click()
    await page.getByTestId("Delete form").click()

    // Confirm the submitted Study form is deleted
    await expect(page.getByTestId("submitted-study-list-item")).toHaveCount(0)
  })

  test("should be able to delete from in Draft state", async ({
    page,
    clickAddObject,
    formActions,
    continueLatestForm,
  }) => {
    test.slow()

    // Add DAC form
    await clickAddObject(FEGAObjectTypes.dac)
    await page.getByTestId("title").fill("Test dac")

    // Save as draft
    await formActions("form-draft")

    await expect(page.getByTestId("draft-dac-list-item")).toHaveCount(1)

    // Reopen draft DAC form
    await continueLatestForm(FEGAObjectTypes.dac, ObjectStatus.draft)
    await expect(page.getByTestId("title")).toHaveValue("Test dac")
    await page.getByTestId("MoreHorizIcon").click()
    await page.getByTestId("Delete form").click()

    // Confirm the draft DAC form is deleted
    await expect(page.getByTestId("draft-dac-list-item")).toHaveCount(0)
  })
})

export {}
