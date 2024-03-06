import React from "react"

import { screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import WizardAlert from "../components/SubmissionWizard/WizardComponents/WizardAlert"

import { ObjectSubmissionsArray } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

describe("WizardAlert", () => {
  test("should render appropriate dialogs", () => {
    const alerts = [
      { location: "submission", types: ObjectSubmissionsArray },
      { location: "footer", types: ["cancel", "save"] },
      { location: "stepper", types: ObjectSubmissionsArray },
    ]
    alerts.forEach((alert: { location: string; types: string[] }) => {
      alert.types.forEach((type: string) => {
        renderWithProviders(
          <BrowserRouter>
            <WizardAlert alertType={type} parentLocation={Object.keys(alert)[0]} onAlert={() => ({})} />
          </BrowserRouter>,
          {
            preloadedState: { submissionType: "" },
          }
        )
        expect(screen.getByRole("dialog")).toBeDefined()
      })
    })
  })
})
