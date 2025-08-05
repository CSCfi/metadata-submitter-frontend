/* Workflows are disabled for MVP */
import { expect } from "@playwright/test"

import test from "../fixtures/commands"

test.describe("Basic SDSX flow", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB
  })
  test("completes SDSX steps and publishes a new submissio", async ({
    page,
    login,
    newSubmission,
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
    await page.getByRole("radio", { name: "another_org workflow" }).check()
    await page
      .locator("div")
      .filter({ hasText: /^Save$/ })
      .first()
      .click()

    /*
     * 3rd step, Datafolder
     */

    await page.getByRole("button", { name: "Datafolder" }).click()
    await page.getByTestId("View file").click()
    await page.getByRole("radio", { name: "folderA" }).check()
    expect(page.getByTestId("link-datafolder")).toBeEnabled()
    await page.getByTestId("link-datafolder").click()

    /*
     * 4th step, Describe
     */
    await page.getByRole("button", { name: "Describe" }).click()
    await page.getByTestId("Add dataset").click()
    await page.getByTestId("title").click()
    await page.getByTestId("title").fill("Dataset title")
    await page.getByTestId("description").click()
    await page.getByTestId("description").fill("Dataset description")
    await page.getByTestId("form-ready").click()

    /*
     * 5th step, Identifier and publish
     */

    await page.getByRole("button", { name: "Identifier and publish" }).click()
    await page.getByTestId("Add datacite").click()
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
    await page
      .locator("div")
      .filter({ hasText: /^Subjects\*Add new item$/ })
      .getByRole("button")
      .click()
    await page.getByTestId("subjects.0.subject").click()
    await page.getByTestId("subjects.0.subject").selectOption("1 - Natural sciences")
  })
})

export {}
