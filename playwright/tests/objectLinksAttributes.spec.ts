import { expect } from "@playwright/test"

import test from "../fixtures/commands"

import { ObjectTypes, ObjectStatus } from "constants/wizardObject"

test.describe("render objects' links and attributes", () => {
  test.beforeEach(async ({ resetDB }) => {
    await resetDB()
  })

  test("should render correct Study Links and Attributes", async ({
    page,
    login,
    newSubmission,
    formActions,
    continueLatestForm,
  }) => {
    test.slow()
    await login()

    await page.getByTestId("link-create-submission").click()

    // Add submission name & description, navigate to submissions
    await newSubmission()

    // Fill a Study form and submit object
    await page.getByTestId("descriptor.studyTitle").fill("Test title")
    await expect(page.getByTestId("descriptor.studyTitle")).toHaveValue("Test title")
    await page.getByTestId("descriptor.studyType").selectOption({ label: "Metagenomics" })
    await page.getByTestId("descriptor.studyAbstract").fill("Test abstract")

    // Add new Study Link
    await page.locator("div[data-testid='studyLinks'] > div").locator("button").click()

    // Choose XRef Link
    await page.getByTestId("studyLinks.0").selectOption({ label: "XRef Link" })
    await page.getByTestId("studyLinks.0.xrefDb").fill("Test XRef Database")
    await page.getByTestId("studyLinks.0.xrefId").fill("Test XRef Database ID")
    await page.getByTestId("studyLinks.0.label").fill("Test XRef Label")

    // URL Links
    await page.locator("div[data-testid='studyLinks'] > div").locator("button").nth(1).click()
    await page.getByTestId("studyLinks.1").selectOption({ label: "URL Link" })
    await page.getByTestId("studyLinks.1.label").fill("Test URL Label")

    // Add new invalid URL Link (form array, one of)
    await page.getByTestId("studyLinks.1.url").fill("testlink.com")
    await page.getByTestId("studyLinks.1.url").blur()
    await expect(
      page
        .locator("p[id='studyLinks.1.url-helper-text']")
        .getByText(/must match pattern/)
        .first()
    ).toBeVisible()

    // Add new valid URL Link
    await page.getByTestId("studyLinks.1.url").clear()
    await page.getByTestId("studyLinks.1.url").fill("https://testlink.com")
    await page.getByTestId("studyLinks.1.url").blur()

    // Add new Entrez Link
    await page.locator("div[data-testid='studyLinks'] > div").locator("button").nth(2).click()
    await page.getByTestId("studyLinks.2").selectOption({ label: "Entrez Link" })

    await page.getByTestId("studyLinks.2.entrezDb").selectOption({ label: "genome" })
    await page.getByTestId("studyLinks.2.entrezId").fill("Test Entrez Database ID")
    await page.getByTestId("studyLinks.2.label").fill("Test Entrez Label")

    // Choose Study Attributes
    await page.locator("div[data-testid='studyAttributes'] > div").locator("button").click()
    await page.getByTestId("studyAttributes.0.tag").fill("Test Attributes Tag")
    await page.getByTestId("studyAttributes.0.value").fill("Test Attributes Value")

    // Save as draft
    await formActions("form-draft")
    await expect(page.getByTestId("study-objects-list").locator("li")).toHaveCount(1)

    // Check submitted object has correnct rendering data
    await continueLatestForm(ObjectTypes.study, ObjectStatus.draft)
    await expect(page.getByTestId("descriptor.studyTitle")).toHaveValue("Test title")

    // Check XRef Link
    await expect(page.getByTestId("studyLinks.0")).toHaveValue("XRef Link")
    await expect(page.getByTestId("studyLinks.0.xrefDb")).toHaveValue("Test XRef Database")
    await expect(page.getByTestId("studyLinks.0.xrefId")).toHaveValue("Test XRef Database ID")
    await expect(page.getByTestId("studyLinks.0.label")).toHaveValue("Test XRef Label")

    // Check URL Link
    await expect(page.getByTestId("studyLinks.1")).toHaveValue("URL Link")
    await expect(page.getByTestId("studyLinks.1.label")).toHaveValue("Test URL Label")
    await expect(page.getByTestId("studyLinks.1.url")).toHaveValue("https://testlink.com")

    // Check Entrez Link
    await expect(page.getByTestId("studyLinks.2")).toHaveValue("Entrez Link")
    await expect(page.getByTestId("studyLinks.2.entrezDb")).toHaveValue("genome")
    await expect(page.getByTestId("studyLinks.2.entrezId")).toHaveValue("Test Entrez Database ID")
    await expect(page.getByTestId("studyLinks.2.label")).toHaveValue("Test Entrez Label")

    await expect(page.getByTestId("studyAttributes.0.tag")).toHaveValue("Test Attributes Tag")
    await expect(page.getByTestId("studyAttributes.0.value")).toHaveValue("Test Attributes Value")

    await expect(
      page
        .locator("div[data-testid='studyLinks'] > div")
        .nth(1)
        .getByTestId(/^studyLinks\[[0-2]\]$/)
    ).toHaveCount(3)

    // Remove URL Link and check that the rest of the Study Links render correctly
    await expect(page.locator("[data-testid='studyLinks[1]'] > button")).toBeVisible()
    await page.locator("[data-testid='studyLinks[1]'] > button").click()
    await expect(page.locator("div[data-testid='studyLinks'] > div")).toHaveCount(2)
    await expect(page.getByTestId("studyLinks.0")).toHaveValue("XRef Link")
    await expect(page.getByTestId("studyLinks.1")).toHaveValue("Entrez Link")

    // Test that removed link item is removed also from backend
    await formActions("form-draft")
    await continueLatestForm(ObjectTypes.study, ObjectStatus.draft)
    await expect(page.locator("div[data-testid='studyLinks'] > div")).toHaveCount(2)
  })
})

export { }
