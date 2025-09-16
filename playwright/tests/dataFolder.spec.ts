import { expect } from "@playwright/test"

import test from "../fixtures/commands"
import { files } from "../fixtures/files_response"

test.describe("Data bucket view", () => {
  test.beforeEach(async ({ page, login, resetDB, newSubmission, clickAccordionPanel }) => {
    await resetDB()
    await login()
    await newSubmission("SDSX")
    await clickAccordionPanel("Data bucket")
    const viewBucketButton = await page.getByTestId("View bucket")
    await viewBucketButton.dispatchEvent("click")

    // Mock files response
    await page.route(`/v1/files`, async route => await route.fulfill({ json: files }))
  })

  test("should be able show correct Bucket table", async ({ page, clickAccordionPanel }) => {
    test.slow()

    await expect(page.getByTestId("link-data-bucket")).toBeDisabled()

    // Assert that 3 buckets are formed from list of files
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(3)

    // Check radio button of 2nd bucket in the Bucket table
    await page.locator("[type='radio']").nth(1).click()

    // Assert that Link data bucket button is enabled after selecting radio button
    await expect(page.getByTestId("link-data-bucket")).toBeEnabled()
    await page.getByTestId("link-data-bucket").click()

    // Assert that bucket table shows linked bucket: "Bucket B"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.locator("[data-id='bucketB']")).toBeVisible()
    // Assert linked bucket's items and size are correct
    await expect(page.getByRole("gridcell", { name: "3" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "600" })).toBeVisible()

    // Save current submission and exit to home page
    await page.getByTestId("save-submission").click()
    await page
      .getByRole("dialog")
      .getByText(/Save and exit/i)
      .click()
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 })
    // Re-open submission and check that linked bucket has been saved to the submission
    await page
      .locator("[role='row']")
      .nth(1)
      .locator("[data-testid='edit-draft-submission']")
      .click()
    await clickAccordionPanel("Data bucket")
    await page.getByTestId("View bucket").click()
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.locator("[data-id='bucketB']")).toBeVisible()
    await expect(page.getByTestId("link-data-bucket")).toBeDisabled()
  })

  test("should be able show correct File table with folders and files", async ({ page }) => {
    test.slow()

    // Click "BucketA"
    await page.getByRole("gridcell", { name: "BucketA" }).click()
    // Assert breadcrumbs shows "All buckets > BucketA"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(3)
    await expect(page.getByTestId("bucketA")).toBeVisible()
    // Assert that 1 file and 3 folders are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(4)
    await expect(page.getByRole("gridcell", { name: "FileA6" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder2" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder3" })).toBeVisible()

    // Click "Folder1"
    await page.getByRole("gridcell", { name: "Folder1" }).click()
    // Assert breadcrumbs shows "All buckets > BucketA > Folder1"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(5)
    await expect(page.getByTestId("folder1")).toBeVisible()
    // Assert that 2 files are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "FileA2" })).toBeVisible()

    // Back to "BucketA"
    await page.getByTestId("bucketA").click()
    // Click "Folder3"
    await page.getByRole("gridcell", { name: "Folder3" }).click()
    // Assert breadcrumbs shows "All buckets > BucketA > Folder3"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(5)
    await expect(page.getByTestId("folder3")).toBeVisible()
    // Assert 1 nested folder "Folder3A" with FolderIcon is shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.getByRole("gridcell", { name: "Folder3A" })).toBeVisible()
    await expect(page.getByTestId("FolderIcon")).toBeVisible()

    // Click "Folder3A"
    await page.getByRole("gridcell", { name: "Folder3A" }).click()
    // Assert breadcrumbs shows "All buckets > BucketA > Folder3 > Folder3A"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(7)
    await expect(page.getByTestId("folder3A")).toBeVisible()
    // Assert 1 file and 1 folder are nested under "Folder3A"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA4" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder3B" })).toBeVisible()

    // Click "Folder3B"
    await page.getByRole("gridcell", { name: "Folder3B" }).click()
    // Assert breadcrumbs shows "All buckets > BucketA > Folder3 > Folder3A > Folder3B"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(9)
    await expect(page.getByTestId("folder3B")).toBeVisible()
    // Assert 1 file is nested under "Folder3B"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(1)
    await expect(page.getByRole("gridcell", { name: "FileA5" })).toBeVisible()
    await expect(page.getByTestId("FolderIcon")).not.toBeVisible()

    // Click back "Folder3A" on Breadcrumbs
    await page.getByTestId("folder3A").click()
    // Assert breadcrumbs shows "All buckets > BucketA > Folder3 > Folder3A"
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(7)
    // Assert 1 file and 1 folder are nested under "Folder3A"
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(2)
    await expect(page.getByRole("gridcell", { name: "FileA4" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder3B" })).toBeVisible()

    // Click back "BucketA" on Breadcrumbs
    // Assert breadcrumbs shows "All buckets > BucketA"
    await page.getByTestId("bucketA").click()
    await expect(page.locator("[data-testid='folder-breadcrumb'] > ol > li")).toHaveCount(3)
    await expect(page.getByTestId("bucketA")).toBeVisible()
    // Assert that 1 file and 3 folders are shown
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(4)
    await expect(page.getByRole("gridcell", { name: "FileA6" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder1" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder2" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "Folder3" })).toBeVisible()

    // Click "All buckets" on Breadcrumbs
    await page.getByTestId("All buckets").click()
    // Assert File table changes to Bucket table, no breadcrumbs are shown anymore
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(3)
    await expect(page.getByRole("gridcell", { name: "BucketA" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "BucketB" })).toBeVisible()
    await expect(page.getByRole("gridcell", { name: "BucketC" })).toBeVisible()
    await expect(page.getByTestId("folder-breadcrumb")).not.toBeVisible()
  })
})

export {}
