import { expect } from "@playwright/test"

import test from "../fixtures/commands"

//A basic e2e tests for saving DOI form and opening it to see again, and moving to Summary view successfully.

test.describe("Filling DOI form", () => {
  test.beforeEach(async ({ login, resetDB, newSubmission }) => {
    await resetDB()
    await login()
    await newSubmission("SDSX")
  })

  test("should be able to fill  and save the required fields", async ({ page }) => {
    test.slow()

    //await clickAccordionPanel("Identifier and publish")
    await page.getByRole("button", { name: "Identifier and publish" }).click()
    await page.getByTestId("Add datacite").click()
    await expect(page.getByRole("heading", { name: "DOI Registration Information" })).toBeVisible()

    // Add a creator
    await page.getByRole("button").filter({ hasText: "Add new item" }).first().click()
    await page.getByTestId("creators.0.givenName").fill("Test")
    await page.getByTestId("creators.0.familyName").fill("User")
    await expect(page.getByTestId("creators.0.givenName")).toHaveValue("Test")
    await expect(page.getByTestId("creators.0.familyName")).toHaveValue("User")

    // And add an affiliation
    await page.getByRole("button").filter({ hasText: "Add new item" }).first().click()
    await page.getByTestId("creators.0.affiliation.0.name-inputField").fill("a")
    await page.getByRole("option", { name: "A&A Biotechnology (Poland)" }).click()
    await expect(page.getByTestId("creators.0.affiliation.0.name-inputField")).not.toBeEmpty()

    // Add subject
    await page
      .locator("div")
      .filter({ hasText: /^Subjects\*Add new item$/ })
      .getByRole("button")
      .click()
    await page.getByTestId("subjects.0.subject").click()
    await page.getByTestId("subjects.0.subject").selectOption("1 - Natural sciences")

    // Add keywords
    await page.getByTestId("keywords").fill("test word")
    await page.getByTestId("keywords").press(",")
    await expect(page.getByTestId("test word")).not.toBeEmpty()
    await page.getByTestId("keywords").fill("third")
    await page.getByTestId("keywords").press("Enter")
    await expect(page.getByTestId("third")).toContainText("third")

    // Save the DOI form
    await page.getByTestId("form-datacite").click()
    await expect(page.getByText("DOI form has been saved successfully")).toBeVisible()

    // Check the DOI input to be persistent
    await page.getByTestId("View Summary").click()
    await page.getByTestId("submitted-datacite-list-item").click()
    await expect(page.getByTestId("creators.0.givenName")).toHaveValue("Test")
    await expect(page.getByTestId("subjects.0.subject")).toHaveValue("1 - Natural sciences")
    await expect(page.getByTestId("third")).toContainText("third")
  })

  test("Should not allow saving of form without required fields", async ({ page }) => {
    test.slow()

    // try to save an empty form
    await page.getByRole("button", { name: "Identifier and publish" }).click()
    await page.getByTestId("Add datacite").click()
    await page.getByTestId("form-datacite").click()
    await page.getByText("must have at least 1 item").first().focus()
    await expect(page.getByText("must have at least 1 item")).toHaveCount(2)
    await page
      .getByText("Please fill in all the required fields.")
      .getByRole("button", { name: "Close" }).click

    // try to save without a keyword
    await page.getByRole("button").filter({ hasText: "Add new item" }).first().click()
    await page.getByTestId("creators.0.givenName").fill("Test")
    await page.getByTestId("creators.0.familyName").fill("Incomplete")
    await expect(page.getByTestId("creators.0.givenName")).toHaveValue("Test")
    await expect(page.getByTestId("creators.0.familyName")).toHaveValue("Incomplete")
    await page.getByRole("button").filter({ hasText: "Add new item" }).first().click()
    await page.getByTestId("creators.0.affiliation.0.name-inputField").fill("b")
    await page.getByRole("option", { name: "B & B" }).click()

    await page
      .locator("div")
      .filter({ hasText: /^Subjects\*.*Add new item$/ })
      .getByRole("button")
      .click()
    await page.getByTestId("subjects.0.subject").click()
    await page.getByTestId("subjects.0.subject").selectOption("2 - Engineering and technology")
    await page.getByTestId("form-datacite").click()
    await expect(page.getByText("Please fill in all the required fields.")).toBeVisible()
  })
})

export {}
