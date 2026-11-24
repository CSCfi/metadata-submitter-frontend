import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router"

import WizardAlert from "../components/SubmissionWizard/WizardComponents/WizardAlert"

import { renderWithProviders } from "utils/test-utils"

describe("WizardAlert", () => {
  test.each([
    { location: "submission", type: "exit" },
    { location: "submission", type: "link" },
    { location: "header", type: "save" },
    { location: "submissionsTable", type: undefined },
  ])("should render $location dialog (alertType: $type)", async ({ location, type }) => {
    renderWithProviders(
      <BrowserRouter>
        <WizardAlert alertType={type} parentLocation={location} onAlert={() => ({})} />
      </BrowserRouter>
    )

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(dialog).not.toHaveTextContent("default")
  })

  test.each([
    { buttonName: "Delete", expected: true },
    { buttonName: "Cancel", expected: false },
  ])(
    "submissionsTable dialog calls onAlert($expected) when '$buttonName' is clicked",
    async ({ buttonName, expected }) => {
      const onAlert = vi.fn()
      renderWithProviders(
        <BrowserRouter>
          <WizardAlert parentLocation="submissionsTable" onAlert={onAlert} />
        </BrowserRouter>
      )

      await userEvent.click(await screen.findByRole("button", { name: buttonName }))
      expect(onAlert).toHaveBeenCalledWith(expected, undefined)
    }
  )
})
