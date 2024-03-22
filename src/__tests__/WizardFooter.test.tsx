import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, fireEvent } from "@testing-library/react"
import { Routes, Route, MemoryRouter } from "react-router-dom"

import WizardFooter from "../components/SubmissionWizard/WizardComponents/WizardFooter"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

describe("WizardFooter", () => {
  let wrapper

  test("should open dialog on click of cancel", () => {
    wrapper = (
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
        <Routes>
          <Route
            path="/submission"
            element={
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={CSCtheme}>
                  <WizardFooter />{" "}
                </ThemeProvider>
              </StyledEngineProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    renderWithProviders(wrapper, {
      preloadedState: { submissionType: ObjectSubmissionTypes.form },
    })
    const button = screen.getByRole("button", { name: /Cancel/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined()
  }),
    test("should disable Publish button if there is no submitted objects", () => {
      wrapper = (
        <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
          <Routes>
            <Route
              path="/submission"
              element={
                <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={CSCtheme}>
                    <WizardFooter />
                  </ThemeProvider>
                </StyledEngineProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      renderWithProviders(wrapper, {
        preloadedState: {
          submissionType: ObjectSubmissionTypes.form,
          submission: {
            submissionId: "FOL001",
            name: "Test submission",
            description: "Test submission",
            published: false,
            drafts: [],
            metadataObjects: [],
            workflow: "FEGA",
            doiInfo: { creators: [], contributors: [], subjects: [] },
          },
        },
      })
      const publishButton = screen.getByRole("button", { name: /Publish/i })
      expect(publishButton).toBeDisabled()
    })
})
