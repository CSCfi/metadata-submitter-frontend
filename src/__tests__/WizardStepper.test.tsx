import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import configureMockStore from "redux-mock-store"
import thunk from "redux-thunk"

import WizardStepper from "../components/SubmissionWizard/WizardComponents/WizardStepper"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe("WizardStepper", () => {
  it("should disable next steps when naming submission", () => {
    const store = mockStore({
      submissionType: "",
      objectTypesArray: Object.keys(ObjectTypes),
      submissionFolder: {
        folderId: "",
        name: "",
        description: "",
        published: false,
        drafts: [],
        metadataObjects: [],
        doiInfo: { creators: [], contributors: [], subjects: [] },
      },
      stepObject: { step: 1, stepObjectType: "submissionDetails" },
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=1" }]}>
        <Provider store={store}>
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
        </Provider>
      </MemoryRouter>
    )
    const secondStep = screen.getByTestId("2-step-disabled")
    expect(secondStep).toBeInTheDocument()
  })
  it("should open dialog if form or upload in progress", () => {
    const store = mockStore({
      submissionType: ObjectSubmissionTypes.form,
      objectTypesArray: Object.keys(ObjectTypes),
      submissionFolder: {
        folderId: "FOLD1234",
        name: "Test folder",
        description: "Folder description",
        published: false,
        drafts: [],
        metadataObjects: [],
        doiInfo: { creators: [], contributors: [], subjects: [] },
      },
      stepObject: { step: 2, stepObjectType: "study" },
      draftStatus: "notSaved",
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=2" }]}>
        <Provider store={store}>
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
        </Provider>
      </MemoryRouter>
    )
    const button = screen.getByRole("button", { name: "Add DAC" })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined
  })
})
