import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { Routes, Route, MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardFooter from "../components/SubmissionWizard/WizardComponents/WizardFooter"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardFooter", () => {
  let store
  let wrapper

  test("should open dialog on click of cancel", () => {
    store = mockStore({
      submissionType: ObjectSubmissionTypes.form,
    })

    wrapper = (
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
        <Provider store={store}>
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
        </Provider>
      </MemoryRouter>
    )
    render(wrapper)
    const button = screen.getByRole("button", { name: /Cancel/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined()
  }),
    test("should disable Publish button if there is no submitted objects", () => {
      store = mockStore({
        submissionType: ObjectSubmissionTypes.form,
        submission: {
          id: "FOL001",
          name: "Test submission",
          description: "Test submission",
          published: false,
          drafts: [],
          metadataObjects: [],
        },
      })

      wrapper = (
        <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
          <Provider store={store}>
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
          </Provider>
        </MemoryRouter>
      )

      render(wrapper)
      const publishButton = screen.getByRole("button", { name: /Publish/i })
      expect(publishButton).toBeDisabled()
    })
})
