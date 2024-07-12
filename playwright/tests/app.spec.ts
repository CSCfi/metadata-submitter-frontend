import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { ObjectTypes } from "constants/wizardObject"

test.describe("Basic application flow", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB()
  })
  test("completes all steps and publishes new submission", async ({
    page,
    login,
    newSubmission,
    formActions,
    optionsActions,
    clickAddObject,
    clickAccordionPanel,
  }) => {
    test.slow()
    await login()

    /*
     * 1st step, Submission details
     */

    // Add submission name & description, navigate to submissions
    await newSubmission()

    /*
     * 2nd step, Study, DAC and Policy
     */

    // Try to send invalid form
    await expect(page.getByTestId("descriptor.studyTitle")).toBeVisible()
    await formActions("form-ready")
    const handle = await page.evaluateHandle(() => document.getElementById("descriptor.studyTitle"))
    const property = await (await handle.getProperty("validationMessage")).jsonValue()
    await expect(property).toMatch(/^Please fill[\sA-Za-z]+/)

    // Fill a Study form and submit object
    await page.getByTestId("descriptor.studyTitle").fill("Test title")
    await expect(page.getByTestId("descriptor.studyTitle")).toHaveValue("Test title")

    await optionsActions("Clear form")

    await page.getByTestId("descriptor.studyTitle").fill("New title")
    await expect(page.getByTestId("descriptor.studyTitle")).toHaveValue("New title")
    await page.getByTestId("descriptor.studyType").selectOption("Metagenomics")
    await page.getByTestId("descriptor.studyAbstract").fill("New abstract")
    // Submit form
    await formActions("form-ready")
    await expect(page.getByTestId("study-objects-list")).toHaveCount(1)

    // DAC form
    await clickAddObject(ObjectTypes.dac)

    // Try to submit empty DAC form. This should be invalid
    await page.getByTestId("title").fill("Test title")
    await formActions("form-ready")
    await expect(page.getByText("must have at least 1 item")).toBeVisible()

    await page.locator("div[data-testid='contacts'] > div > button").click()
    await page.getByTestId("contacts.0.name").fill("Test contact name")
    // Test invalid email address (form array, default)
    await page.getByTestId("contacts.0.email").fill("email")
    await expect(page.locator("p[id='contacts.0.email-helper-text']")).toHaveText(
      'must match format "email"'
    )
    await page.getByTestId("contacts.0.email").fill("email@test.com")
    await page.getByTestId("contacts.0.telephoneNumber").fill("123456789")
    await page.getByTestId("contacts.0.organisation-inputField").fill("Test organization")
    // Click outside from organisation autocomplete field to hide suggestions
    await page.getByTestId("contacts.0.telephoneNumber").click()
    await page.getByTestId("contacts.0.mainContact").check()
    // Submit DAC form
    await formActions("form-ready")

    // Test DAC form update
    await page.getByTestId("dac-objects-list").filter({ hasText: "Test title" }).click()
    await expect(page.getByTestId("title")).toBeVisible()
    await page.getByTestId("title").fill("Test title edited")
    await expect(page.getByTestId("title")).toHaveValue("Test title edited")
    await formActions("form-ready")

    await page.getByRole("alert", { name: "Object updated" })
    await expect(
      page.getByTestId("dac-objects-list").filter({ hasText: "Test title edited" })
    ).toBeVisible()

    // Fill Policy form
    await clickAddObject(ObjectTypes.policy)
    await page.getByTestId("title").fill("Test Policy title")
    await page.getByTestId("dacRef.accessionId").selectOption({ index: 1 })
    await expect(page.getByTestId("dacRef.accessionId")).toContainText(" - Main Contact:")
    await page.getByTestId("policy").selectOption("Policy Text")
    await page.getByTestId("policy.policyText").fill("Test policy text")
    // Submit Policy form
    await formActions("form-ready")

    /*
     * 3rd step, Files
     */

    await clickAccordionPanel("Files")
    await expect(page.getByTestId("file-details")).toBeVisible()
    await page.getByRole("button", { name: "Add file" }).click()

    /*
     * 4th step, Describe
     */
    await clickAccordionPanel("Describe")
  })
  // TODO: The rest of the workflows until Publish should be tested
})

export {}
