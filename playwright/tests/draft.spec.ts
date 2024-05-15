import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { DisplayObjectTypes, ObjectTypes } from "constants/wizardObject"

test.describe("Draft operations", () => {
  test.beforeEach(async ({ page, login, generateSubmissionAndObjects, resetDB }) => {
    await resetDB()
    await login()
    // Add submission name & description, navigate to submissions
    await generateSubmissionAndObjects(ObjectTypes.dac)
    // Edit newly created submission
    await page.getByText("Edit").first().click()
    await page.waitForLoadState()
  })

  test("should create new submission, save, clear and continue draft", async ({
    page,
    clickAccordionPanel,
    clickAddObject,
    formActions,
    continueLatestDraft,
    optionsActions,
  }) => {
    test.slow()
    await clickAccordionPanel("Study, DAC and Policy")

    // Create a new DAC form and submit
    await clickAddObject(DisplayObjectTypes.dac)
    await page.getByTestId("title").fill("Test DAC title")
    await page.locator("div[data-testid='contacts'] > div > button").click()
    await page.getByTestId("contacts.0.name").fill("Test contact name")
    await page.getByTestId("contacts.0.email").fill("email@test.com")
    await page.getByTestId("contacts.0.telephoneNumber").fill("123456789")
    await page.getByTestId("contacts.0.organisation-inputField").fill("Test organization")
    // Click outside from organisation autocomplete field to hide suggestions
    await page.getByTestId("contacts.0.telephoneNumber").click()
    await page.getByTestId("contacts.0.mainContact").check()
    // Submit DAC form
    await formActions("form-ready")

    // Fill a Policy form
    await clickAddObject("policy")

    page.getByTestId("title").fill("Test title")

    // Save a draft
    await formActions("form-draft")
    await page.getByRole("alert").filter({ hasText: "Draft saved with" })
    await expect(page.getByTestId("policy-objects-list").filter({ has: page.locator("li") })).toHaveCount(1)
    // Save another draft
    await clickAddObject("policy")
    await expect(page.getByTestId("title")).toHaveValue("")
    await page.getByTestId("title").fill("Test title 2")
    await formActions("form-draft")
    await page.getByRole("alert").filter({ hasText: "Draft saved with" })
    await expect(page.getByTestId("policy-objects-list").locator("li")).toHaveCount(2)

    // Update draft, save from dialog
    await page.getByTestId("title").fill("Test title 2 second save")
    await continueLatestDraft(ObjectTypes.policy)
    await expect(
      page
        .locator("h2")
        .getByText(/Would you like to save draft version of this form/)
        .first()
    ).toBeVisible()
    await page.getByRole("dialog").getByText(/Save/).first().click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
    await expect(page.getByTestId("policy-objects-list").locator("li")).toHaveCount(2)

    // Continue first draft
    await continueLatestDraft(ObjectTypes.policy)

    // Clear form
    await optionsActions("Clear form")

    // Fill
    await expect(page.getByTestId("title")).toHaveValue("")
    await page.getByTestId("title").fill("New title")
    await expect(page.getByTestId("title")).toHaveValue("New title")
    await page.getByTestId("dacRef.accessionId").selectOption({ index: 1 })
    await formActions("form-draft")
    await expect(
      page
        .getByRole("alert")
        .getByText(/Draft updated with/)
        .first()
    ).toBeVisible()

    // Submit first form draft
    await continueLatestDraft(ObjectTypes.policy)

    await page.getByTestId("dacRef.accessionId").selectOption({ index: 1 })
    await page.getByTestId("policy").selectOption({ label: "Policy Text" })
    await page.getByTestId("policy.policyText").fill("Test policy text")
    await formActions("form-ready")
    await expect(
      page
        .getByRole("alert")
        .getByText(/Submitted with/)
        .first()
    ).toBeVisible()

    // Submit second form draft
    await continueLatestDraft(ObjectTypes.policy)
    await expect(page.getByTestId("policy")).toBeVisible()
    await page.getByTestId("policy").selectOption({ label: "Policy Text" })
    await page.getByTestId("policy.policyText").fill("Test policy text")
    await formActions("form-ready")
    // Check that there are 2 submitted objects
    await expect(page.getByTestId("policy-objects-list").locator("li")).toHaveCount(2)
  })
})

export {}
