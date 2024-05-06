import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("i18n translation", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB()
  })

  test("should login with finnish translation when finnish locale is chosen", async ({ page, login }) => {
    await page.goto("/")

    await page.getByTestId("lang-selector").click()
    await page.getByTestId("fi-lang").getByText(/Fi/).first().click()

    await login()

    /* To be filled with new translation check later */
  })

  test("should change translation seamlessly", async ({ login, page }) => {
    await login()
    /* To be filled with new translation check later */
    await page.getByTestId("lang-selector").click()
    await page.getByTestId("fi-lang").getByText(/Fi/).first().click()
    await expect(page).toHaveURL(/\/fi\//)
    /* To be filled with new translation check later */
  })

  test("should navigate with selected locale", async ({ login, page }) => {
    await login()
    await page.locator("[data-testid='lang-selector']").click()
    await page.locator("[data-testid='fi-lang']").getByText(/Fi/).first().click()
    await page
      .locator("button")
      .getByText(/Create submission/)
      .first()
      .click()
    await expect(page).toHaveURL(/\/fi\/submission/)
  })
})

export {}
