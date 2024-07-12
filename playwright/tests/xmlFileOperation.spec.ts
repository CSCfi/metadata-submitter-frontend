import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { ObjectTypes } from "constants/wizardObject"

test.describe("XML File Operation", () => {
  test.beforeEach(async ({ login, resetDB, newSubmission }) => {
    await resetDB()
    await login()
    await newSubmission()
  })

  test("should be able to validate XML files", async ({ page, clickAddObject }) => {
    test.slow()

    // Add Study object
    await clickAddObject(ObjectTypes.study)

    // Upload XML File
    await page.getByTestId("MoreHorizIcon").click()
    await page.getByTestId("Upload XML").click()
    await page.getByTestId("select-xml-file").click()

    // Invalid XML File is validated
    await page
      .getByTestId("xml-upload")
      .setInputFiles("./playwright/fixtures/study_test_invalid.xml")

    await expect(page.getByRole("heading", { name: "study_test_invalid.xml" })).not.toBeVisible()

    // Valid XML File is validated
    await page.getByTestId("xml-upload").setInputFiles("./playwright/fixtures/study_test.xml")

    await expect(page.getByRole("heading", { name: "study_test.xml" })).toBeVisible()
  })
})

export {}
