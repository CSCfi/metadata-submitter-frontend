import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("catch error codes and display corresponding error page", function () {
  test("should redirect to 400 page if response status code is 400 ", async ({ page, login }) => {
    await login()
    await page.getByTestId("link-create-submission").click()
    await page.getByTestId("submissionName").fill("Test name")
    await page.getByTestId("submissionDescription").fill("Test description")
    await page.getByTestId("create-submission").click()
    await page.route("/v1/submissions*", async route => {
      await route.fulfill({
        body: "Bad request!",
        status: 400,
      })
    })
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(page.locator(".MuiAlert-message", { hasText: /400 Bad Request/ }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 401 page if no granted access", async ({ page }) => {
    await page.goto("/en/submission?step=1")
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 })
    await expect(page.locator(".MuiAlert-message", { hasText: /401 Authorization Error/ }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 403 page if response status code is 403 ", async ({ page, login }) => {
    await login()
    await page.route("/v1/submissions*", async route => {
      route.fulfill({
        body: "Access is forbidden!",
        status: 403,
      })
    })
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(page.locator(".MuiAlert-message", { hasText: /403 Forbidden Error/ }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 404 page on unknown route", async ({ page, login }) => {
    await login()
    await page.goto("/home/unknownroute")
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(page.locator(".MuiAlert-message", { hasText: /404 Not Found/ }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 500 page if response status code is 500 ", async ({ page, login }) => {
    await login()
    await page.route("/v1/submissions*", route => {
      route.fulfill({
        body: "Internal server error!",
        status: 500,
      })
    })
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(page.locator(".MuiAlert-message", { hasText: /500 Internal Server Error/ }).first()).toBeVisible({
      timeout: 10000,
    })
  })
})

export {}
