/* Workflows are disabled for MVP */
import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Basic SD flow", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB
  })
  test("completes SD steps and publishes a new submission", async ({
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
    await newSubmission("SD")

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
     * 3rd step, Data bucket
     */

    await page.getByRole("button", { name: "Data bucket" }).click()
    await page.getByTestId("View bucket").click()
    await page.getByRole("radio", { name: "bucketA" }).check()
    await expect(page.getByTestId("link-data-bucket")).toBeEnabled()
    await page.getByTestId("link-data-bucket").click()

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
