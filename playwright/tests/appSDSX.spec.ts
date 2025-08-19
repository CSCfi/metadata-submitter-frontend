/* Workflows are disabled for MVP */
import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Basic SDSX flow", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB
  })
  test("completes SDSX steps and publishes a new submission", async ({
    page,
    login,
    newSubmission,
    formActions,
    clickAccordionPanel,
    clickAddObject,
  }) => {
    test.slow()

    /*
     * 1st step, Submission details
     */

    // Add submission name & description
    await login()
    await newSubmission("SDSX")

    /*
     * 2nd step DAC and Policy
     */

    await expect(
      page.getByTestId("dacPolicies-details").getByText("DAC and policies")
    ).toBeVisible()
    await page.getByRole("combobox", { name: "Select organization" }).click()
    await page.getByTestId("CSC").click()
    await page.getByTestId("1").getByRole("radio").check()
    await formActions("form-ready")

    /*
     * 3rd step, Datafolder
     */

    await page.getByRole("button", { name: "Datafolder" }).click()
    await page.getByTestId("View linkedFolder").click()
    await page.getByRole("radio", { name: "folderA" }).check()
    await expect(page.getByTestId("link-datafolder")).toBeEnabled()
    await page.getByTestId("link-datafolder").click()

    /*
     * 4th step, Identifier and publish
     */

    // DOI
    await clickAccordionPanel("Identifier and publish")
    await clickAddObject("datacite")
    await page
      .locator("div")
      .filter({ hasText: /^Creators\*Add new item$/ })
      .getByRole("button")
      .click()
    await page.getByTestId("creators.0.givenName").click()
    await page.getByTestId("creators.0.givenName").fill("Jane")
    await page.getByTestId("creators.0.familyName").click()
    await page.getByTestId("creators.0.familyName").fill("Doe")
    await page
      .locator("div")
      .filter({ hasText: /^Affiliations\*Add new item$/ })
      .getByRole("button")
      .click()
    await page.getByTestId("creators.0.affiliation.0.name-inputField").click()
    await page.getByTestId("creators.0.affiliation.0.name-inputField").fill("a")
    await page.getByRole("option", { name: "A&A Biotechnology (Poland)" }).click()
    await page.getByTestId("keywords").fill("keyword")
    await formActions("form-datacite")

    // Summary
    await page.getByTestId("View summary").click()
    await expect(
      page.getByTestId("summary-step-1").getByRole("heading", { name: "1. Submission details" })
    ).toBeVisible()
  })
})

export {}
