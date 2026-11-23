import { screen } from "@testing-library/react"
import { BrowserRouter } from "react-router"

import WizardAlert from "../components/SubmissionWizard/WizardComponents/WizardAlert"

import { renderWithProviders } from "utils/test-utils"

describe("WizardAlert", () => {
  test("should render appropriate dialogs", async () => {
    const alerts = [
      { location: "submission", types: ["exit", "link"] },
      { location: "header", types: ["save"] },
    ]

    alerts.forEach(async (alert: { location: string; types: string[] }) => {
      alert.types.forEach(async (type: string) => {
        renderWithProviders(
          <BrowserRouter>
            <WizardAlert alertType={type} parentLocation={alert.location} onAlert={() => ({})} />
          </BrowserRouter>
        )
        const dialog = await screen.findByRole("dialog")
        expect(dialog).toBeDefined()
        expect(dialog).not.toHaveTextContent("default")
      })
    })
  })

  test("should render submissionsTable dialog", async () => {
    renderWithProviders(
      <BrowserRouter>
        <WizardAlert parentLocation="submissionsTable" onAlert={() => ({})} />
      </BrowserRouter>
    )

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(dialog).not.toHaveTextContent("default")
  })
})
