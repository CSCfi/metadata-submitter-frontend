import { expect } from "@playwright/test"

import test from "../fixtures/commands"
import { files } from "../fixtures/files_response"

import { ObjectTypes } from "constants/wizardObject"

test.describe("DataFolder view", () => {
  test.beforeEach(async ({ login, resetDB, generateSubmissionAndObjects }) => {
    await resetDB()
    await login()
    await generateSubmissionAndObjects(ObjectTypes.policy)
  })

  test("should be able show correct Datafolder table", async ({ page, clickAccordionPanel }) => {
    test.slow()

    // Edit newly created submission
    await page.getByText("Edit").first().click()
    await page.waitForLoadState()

    await clickAccordionPanel("Datafolder")
    await page.getByTestId("View Datafolder").click()
    await expect(page.getByTestId("link-datafolder")).toBeDisabled()

    // Mock files response
    await page.route(`/v1/files`, async route => await route.fulfill({ json: files }))

    // Assert that 3 folders are formed from list of files
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(3)

    // Check radio button of 2nd folder in the Folder table
    await page.locator("[type='radio']").nth(1).click()

    // Assert that Link folder button is enabled after selecting radio button
    await expect(page.getByTestId("link-datafolder")).toBeEnabled()
    await page.getByTestId("link-datafolder").click()

    // Assert that Folder table should show only linked folder: "Folder B"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.locator("[data-id='folderB']")).toBeVisible()
    // Assert linked folder's items and size are correct
    await expect(page.getByRole("gridcell", { name: "3" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "600" })).toBeVisible()
  })
})

export {}
