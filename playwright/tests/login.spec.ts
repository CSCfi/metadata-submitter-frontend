import { expect, type Page } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Login e2e", () => {
  let page: Page

  test.beforeAll(async ({ resetDB, setMockUser, browser }) => {
    await resetDB()
    page = await browser.newPage()
    await setMockUser(false)
    await page.goto("/")
    await page.getByTestId("login-button").click()
    await page.waitForLoadState("load")
  })

  test.afterAll(async ({ setMockUser }) => {
    await setMockUser(true)
    await page.close()
  })

  test("should contain session cookie", async ({}) => {
    const context = await page.context()
    const cookies = (await context.cookies()).find(c => c.name === "access_token")
    expect(cookies?.value).toBeDefined()
  })
  test("should contain the test user name", async ({}) => {
    await expect(page.locator("[data-testid='user-setting-button'] > h6")).toContainText(
      "E2EUser FrontendTest"
    )
  })
  test("should go to main page on logout", async ({}) => {
    await page.getByTestId("user-setting-button").click()
    await page.getByTestId("logout").click()
    await expect(page).toHaveURL(/.*\/$/)
  })
})

export {}
