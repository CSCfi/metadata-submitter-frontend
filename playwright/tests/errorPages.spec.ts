import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("catch error codes and display corresponding error page", function () {
  test("should redirect to 400 page if response status code is 400 ", async ({ page, login }) => {
    await login()
    await page.route("/v1/submissions*", async route => {
      await route.fulfill({
        body: "Bad request!",
        status: 400,
      })
    })
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(
      page.locator(".MuiCard-root", { hasText: /400 – BAD REQUEST/ }).first()
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 401 page if no granted access", async ({ page }) => {
    await page.goto("/en/submission?step=1")
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 })
    await expect(
      page.locator(".MuiCard-root", { hasText: /401 – NOT LOGGED IN/ }).first()
    ).toBeVisible({
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
    await expect(
      page.locator(".MuiCard-root", { hasText: /403 – FORBIDDEN/ }).first()
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test("should redirect to 404 page on unknown route", async ({ page, login }) => {
    await login()
    await page.goto("/home/unknownroute")
    await page.waitForLoadState("load", { timeout: 30000 })
    await expect(
      page.locator(".MuiCard-root", { hasText: /404 – PAGE NOT FOUND/ }).first()
    ).toBeVisible({
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
    await expect(
      page.locator(".MuiCard-root", { hasText: /500 – SERVICE UNAVAILABLE/ }).first()
    ).toBeVisible({
      timeout: 10000,
    })
  })
})

export {}
