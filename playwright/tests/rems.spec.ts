import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { SDObjectTypes } from "constants/wizardObject"

test.describe("Submitting REMS data", () => {
  test.beforeEach(async ({ login, resetDB, newSubmission }) => {
    await resetDB()
    await login()

    // Add submission name & description
    await newSubmission("SD")
  })

  test("should be able to select Organization, DAC, and Policies and Save", async ({
    page,
    clickAddObject,
    formActions,
  }) => {
    test.slow()
    await clickAddObject(SDObjectTypes.dacPolicies)

    // Select organization, DAC and additional Policy
    await page.getByTestId("organizationId").click()
    await page.getByTestId("CSC").click()
    await expect(page.getByTestId("dacs")).toBeVisible()
    await page
      .getByTestId("1")
      .filter({ has: page.locator("[type='radio']") })
      .click()
    await page.getByTestId("3").click()

    await formActions("form-ready")
    // Assert REMS data is saved successfully
    await page
      .getByRole("alert")
      .filter({ hasText: "REMS information has been saved successfully" })

    // Change to another organization
    await page.getByTestId("organizationId").click()
    await page.getByTestId("org2").click()
    // Assert DAC has been changed based on organization
    await expect(page.getByTestId("dacs")).toBeVisible()
    await page
      .getByTestId("3")
      .filter({ has: page.locator("[type='radio']") })
      .click()
    // Assert additional Policies have been changed based on organization
    await page
      .getByTestId("2")
      .filter({ has: page.locator("[type='checkbox']") })
      .click()

    await formActions("form-ready")
    // Assert REMS data is saved successfully
    await page
      .getByRole("alert")
      .filter({ hasText: "REMS information has been saved successfully" })

    // Assert the left side Accordion shows saved DAC title and number of Policies
    await expect(page.getByTestId("submitted-dacPolicies-list-item")).toHaveCount(2)
    await expect(
      page
        .getByTestId("submitted-dacPolicies-list-item")
        .filter({ hasText: "Sensitive Data Access WF2 (Org 2)" })
    ).toBeVisible()
    await expect(
      page.getByTestId("submitted-dacPolicies-list-item").filter({ hasText: "1 policy" })
    ).toBeVisible()
  })
})

export {}
