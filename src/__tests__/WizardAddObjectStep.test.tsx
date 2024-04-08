import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import CSCtheme from "../theme"

import { ObjectSubmissionsArray, ObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  it("should not render any cards if no selected object type", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
        <Routes>
          <Route
            path="/submission"
            element={
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={CSCtheme}>
                  <WizardAddObjectStep />{" "}
                </ThemeProvider>
              </StyledEngineProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          objectType: "",
        },
      }
    )
    expect(screen.getByText("Add objects by clicking the name, then fill form or upload XML File.")).toBeInTheDocument()
  })

  test("should render appropriate card", async () => {
    ObjectSubmissionsArray.forEach(typeName => {
      act(() =>
        renderWithProviders(
          <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
            <Routes>
              <Route
                path="/submission"
                element={
                  <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={CSCtheme}>
                      <WizardAddObjectStep />
                    </ThemeProvider>
                  </StyledEngineProvider>
                }
              />
            </Routes>
          </MemoryRouter>,
          {
            preloadedState: {
              objectType: ObjectTypes.study,
              submissionType: typeName,
            },
          }
        )
      )
      expect(screen.getByTestId(typeName)).toBeInTheDocument()
    })
  })
})
