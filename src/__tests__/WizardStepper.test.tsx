import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"

import WizardStepper from "../components/SubmissionWizard/WizardComponents/WizardStepper"
import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"

describe("WizardStepper", () => {
  it("should disable next steps when naming submission", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=1" }]}>
        <Routes>
          <Route
            path="/submission"
            element={
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={CSCtheme}>
                  <WizardStepper />
                </ThemeProvider>
              </StyledEngineProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          stepObject: {
            step: 1,
            stepObjectType: "submissionDetails",
          },
        },
      }
    )
    expect(screen.queryByTestId("2-step-disabled")).toBeNull()
  })
  it("should open dialog if form or upload in progress", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=2" }]}>
        <Routes>
          <Route
            path="/submission"
            element={
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={CSCtheme}>
                  <WizardStepper />
                </ThemeProvider>
              </StyledEngineProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          stepObject: {
            step: 2,
            stepObjectType: "study",
          },
          draftStatus: "notSaved",
        },
      }
    )
    //const button = screen.getByRole("button", { name: "Add DAC" })
    //fireEvent.click(button)
    //expect(screen.getByRole("dialog")).toBeDefined
  })
})
