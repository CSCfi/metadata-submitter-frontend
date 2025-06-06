import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Login e2e", () => {
  test.beforeEach(async ({ resetDB, setMockUser }) => {
    await resetDB()
    await setMockUser()
  })
  test("should contain session cookie", async ({ page, login }) => {
    await login()
    const context = await page.context()
    const cookies = (await context.cookies()).find(c => c.name === "access_token")
    expect(cookies?.value).toBeDefined()
  })
  test("should contain the test user name", async ({ login, page }) => {
    await login()
    await expect(page.locator("[data-testid='user-setting-button'] > h6")).toContainText(
      "E2EUser FrontendTest"
    )
  })
  test("should go to main page on logout", async ({ login, page }) => {
    await login()
    await page.getByTestId("user-setting-button").click()
    await page.getByTestId("logout").click()
    await expect(page).toHaveURL(/.*\/$/)
  })
})

export {}
