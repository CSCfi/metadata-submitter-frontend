import { expect } from "@playwright/test"

import test from "../fixtures/commands"
import { files } from "../fixtures/files_response"

import { ObjectTypes } from "constants/wizardObject"

test.describe("DataFolder view", () => {
  test.beforeEach(
    async ({ page, login, resetDB, generateSubmissionAndObjects, clickAccordionPanel }) => {
      await resetDB()
      await login()
      await generateSubmissionAndObjects(ObjectTypes.policy)

      // Edit newly created submission
      await page.getByText("Edit").first().click()
      await page.waitForLoadState()

      await clickAccordionPanel("Datafolder")
      const viewfileButton = await page.getByTestId("View file")
      await viewfileButton.dispatchEvent("click")

      // Mock files response
      await page.route(`/v1/files`, async route => await route.fulfill({ json: files }))
    },
  )

  test("should be able show correct Folder table", async ({ page, clickAccordionPanel }) => {
    test.slow()

    await expect(page.getByTestId("link-datafolder")).toBeDisabled()

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

    // Save current submission and exit to home page
    await page.getByTestId("save-submission").click()
    await page
      .getByRole("dialog")
      .getByText(/Save and exit/i)
      .click()
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 })
    // Re-open submission and check that linked folder has been saved to the submission
    await page
      .locator("[role='row']")
      .nth(1)
      .locator("[data-testid='edit-draft-submission']")
      .click()
    await clickAccordionPanel("Datafolder")
    await page.getByTestId("View file").click()
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.locator("[data-id='folderB']")).toBeVisible()
    await expect(page.getByTestId("link-datafolder")).toBeDisabled()
  })

  test("should be able show correct File table with subfolders and files", async ({ page }) => {
    test.slow()

    // Click "FolderA"
    await page.getByRole("gridcell", { name: "FolderA" }).click()
    // Assert breadcrumbs shows "All folder > Folder A"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(3)
    await expect(page.getByTestId("folderA")).toBeVisible()
    // Assert that 1 file and 3 folders are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(4)
    await expect(page.getByRole("gridcell", { name: "FileA6" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder2" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder3" })).toBeVisible()

    // Click "Subfolder1"
    await page.getByRole("gridcell", { name: "Subfolder1" }).click()
    // Assert breadcrumbs shows "All folder > Folder A > Subfolder1"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(5)
    await expect(page.getByTestId("subfolder1")).toBeVisible()
    // Assert that 2 files are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "FileA2" })).toBeVisible()

    // Back to "FolderA"
    await page.getByTestId("folderA").click()
    // Click "Subfolder3"
    await page.getByRole("gridcell", { name: "Subfolder3" }).click()
    // Assert breadcrumbs shows "All folder > Folder A > Subfolder3"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(5)
    await expect(page.getByTestId("subfolder3")).toBeVisible()
    // Assert 1 nested subfolder "Subfolder3A" with FolderIcon is shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.getByRole("gridcell", { name: "Subfolder3A" })).toBeVisible()
    await expect(page.getByTestId("FolderIcon")).toBeVisible()

    // Click "Subfolder3A"
    await page.getByRole("gridcell", { name: "Subfolder3A" }).click()
    // Assert breadcrumbs shows "All folder > Folder A > Subfolder3 > Subfolder3A"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(7)
    await expect(page.getByTestId("subfolder3A")).toBeVisible()
    // Assert 1 file and 1 subfolder are nested under "Subfolder3A"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA4" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder3B" })).toBeVisible()

    // Click "Subfolder3B"
    await page.getByRole("gridcell", { name: "Subfolder3B" }).click()
    // Assert breadcrumbs shows "All folder > Folder A > Subfolder3 > Subfolder3A > Subfolder3B"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(9)
    await expect(page.getByTestId("subfolder3B")).toBeVisible()
    // Assert 1 file is nested under "Subfolder3B"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.getByRole("gridcell", { name: "FileA5" })).toBeVisible()
    await expect(page.getByTestId("FolderIcon")).not.toBeVisible()

    // Click back "Subfolder3A" on Breadcrumbs
    await page.getByTestId("subfolder3A").click()
    // Assert breadcrumbs shows "All folder > Folder A > Subfolder3 > Subfolder3A"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(7)
    // Assert 1 file and 1 subfolder are nested under "Subfolder3A"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA4" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder3B" })).toBeVisible()

    // Click back "FolderA" on Breadcrumbs
    // Assert breadcrumbs shows "All folder > Folder A"
    await page.getByTestId("folderA").click()
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(3)
    await expect(page.getByTestId("folderA")).toBeVisible()
    // Assert that 1 file and 3 folders are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(4)
    await expect(page.getByRole("gridcell", { name: "FileA6" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder2" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Subfolder3" })).toBeVisible()

    // Click "All folder" on Breadcrumbs
    await page.getByTestId("All folders").click()
    // Assert File table changes to Folder table, no breadcrumbs are shown anymore
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(3)
    await expect(page.getByRole("gridcell", { name: "FolderA" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "FolderB" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "FolderC" })).toBeVisible()
    await expect(page.getByTestId("folder-breadcrumb")).not.toBeVisible()
  })
})

export {}
