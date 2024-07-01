import React from "react"

import { ThemeProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import WizardAlert from "../components/SubmissionWizard/WizardComponents/WizardAlert"
import CSCtheme from "../theme"

import { ObjectSubmissionsArray } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

describe("WizardAlert", () => {
  test("should render appropriate dialogs", () => {
    const alerts = [
      { location: "submission", types: ObjectSubmissionsArray },
      { location: "header", types: ["save", "publish"] },
    ]
    alerts.forEach((alert: { location: string; types: string[] }) => {
      alert.types.forEach((type: string) => {
        renderWithProviders(
          <ThemeProvider theme={CSCtheme}>
            <BrowserRouter>
              <WizardAlert
                alertType={type}
                parentLocation={Object.values(alert)[0].toString()}
                onAlert={() => ({})}
              />
            </BrowserRouter>
          </ThemeProvider>
        )
        expect(screen.getByRole("dialog")).toBeDefined()
        expect(screen.getByRole("dialog")).not.toHaveTextContent("default")
      })
    })
  })
})
