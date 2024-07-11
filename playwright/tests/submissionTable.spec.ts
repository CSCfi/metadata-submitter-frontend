import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Submission data table in Home view", () => {
  test.beforeEach(async ({ resetDB, login, page, mockGetSubmissions }) => {
    await resetDB()
    await login()
    // Mock API responses for getting draft and published submissions
    await mockGetSubmissions(5, false)
    await mockGetSubmissions(30, false)
    await mockGetSubmissions(5, true)
    await mockGetSubmissions(10, true)
    await page.waitForLoadState("load", { timeout: 30000 })
  })
  test("should show correct info of submissions with pagination", async ({
    page,
    checkItemsPerPage,
  }) => {
    test.slow()

    // Assert that "All Submissions" tab is selected
    await expect(page.getByTestId("all-tab")).toBeVisible()
    await expect(page.getByTestId("all-tab")).toHaveAttribute("aria-selected", "true")

    // Assert that there are 5 submissions on the table
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(5)

    // Check current number of items shows correct (total of 40 items)
    await expect(page.getByText("1-5 / 40 items")).toBeVisible()

    // Check current number of pages shows correct (40 items/8 pages)
    await expect(page.locator("[aria-label='page 1']")).toBeVisible()
    await expect(page.locator("[aria-label='Go to page 8']")).toBeVisible()

    // Assert changing page works
    await page.locator("[aria-label='Go to page 8']").click()
    await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(5)

    // Select 50 items per page
    await checkItemsPerPage(50, 40)
  })

  test("should show correct submissions on changing tabs", async ({ page, checkItemsPerPage }) => {
    test.slow()

    // Assert that "Draft Submissions" and "Published Submissions" tabs are visible
    await expect(page.getByTestId("draft-tab")).toBeVisible()
    await expect(page.getByTestId("published-tab")).toBeVisible()

    // Select tab "Draft Submissions"
    await page.getByTestId("draft-tab").click()

    // Check current number of items shows correct (total of 30 items)
    await expect(page.getByText("1-5 / 30 items")).toBeVisible()

    // Select 50 items per page
    await checkItemsPerPage(50, 30)

    // Select tab "Published Submissions"
    await page.getByTestId("published-tab").click()

    // Check current number of items shows correct (total of 10 items)
    await expect(page.getByText("1-5 / 10 items")).toBeVisible()

    // Select 10 items per page
    await checkItemsPerPage(10, 10)
  })

  test("should have Edit action available for Draft Submissions", async ({ page }) => {
    test.slow()

    // Select tab "Published Submissions"
    await page.getByTestId("published-tab").click()

    // Assert that Edit and Delete buttons do not exist
    await expect(page.getByTestId("edit-draft-submission")).not.toBeVisible()
    await expect(page.getByTestId("delete-draft-submission")).not.toBeVisible()

    // Select tab "Draft Submissions"
    await page.getByTestId("draft-tab").click()

    // Assert that Edit button exist for Draft Submissions
    await expect(page.getByTestId("edit-draft-submission")).toHaveCount(5)

    // Assert that Edit button opens the Submission details again
    await page.getByTestId("edit-draft-submission").nth(0).click()
    await expect(page).toHaveURL(/\/submission\/DRAFT[0-9]+[?]step=1/)
  })

  test("should have Delete action available for Draft Submissions", async ({ page }) => {
    test.slow()

    // Select tab "Draft Submissions"
    await page.getByTestId("draft-tab").click()

    // Assert that Delete button exist for Draft Submissions
    await expect(page.getByTestId("delete-draft-submission")).toHaveCount(5)

    // Mock for Delete request
    await page.route("/v1/submissions/*", async route => {
      await route.fulfill({
        status: 204,
      })
    })

    // Assert that Delete button works and success notification shows
    await page.getByTestId("delete-draft-submission").nth(0).click()
    await expect(
      page
        .locator(".MuiAlert-message", { hasText: /The submission has been deleted successfully!/ })
        .first()
    ).toBeVisible()
  })
})

export {}
