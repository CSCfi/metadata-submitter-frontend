import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/NewDraftWizard/WizardSteps/WizardAddObjectStep"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectSubmissionsArray, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  it("should not render any cards if no selected object type", () => {
    const store = mockStore({
      objectType: "",
      objectTypesArray: [
        ObjectTypes.study,
        ObjectTypes.sample,
        ObjectTypes.experiment,
        ObjectTypes.run,
        ObjectTypes.analysis,
        ObjectTypes.dac,
        ObjectTypes.policy,
        ObjectTypes.dataset,
      ],
      submissionType: ObjectSubmissionTypes.xml,
      submissionFolder: {
        name: "folder name",
        description: "folder description",
        published: false,
        metadataObjects: [],
        id: "FOL12341234",
        drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study }],
      },
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "step=1" }]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/newdraft"
              element={
                <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={CSCtheme}>
                    <WizardAddObjectStep />{" "}
                  </ThemeProvider>
                </StyledEngineProvider>
              }
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    )
    expect(screen.getByText("Add objects by clicking the name, then fill form or upload XML File.")).toBeInTheDocument()
  })

  it("should render appropriate card", async () => {
    await act(async () => {
      ObjectSubmissionsArray.forEach(typeName => {
        const store = mockStore({
          objectType: ObjectTypes.study,
          objectTypesArray: [
            ObjectTypes.study,
            ObjectTypes.sample,
            ObjectTypes.experiment,
            ObjectTypes.run,
            ObjectTypes.analysis,
            ObjectTypes.dac,
            ObjectTypes.policy,
            ObjectTypes.dataset,
          ],
          submissionType: typeName,
          submissionFolder: {
            description: "Test",
            id: "FOL12341234",
            name: "Testname",
            published: false,
            drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study }],
          },
        })
        render(
          <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "step=1" }]}>
            <Provider store={store}>
              <Routes>
                <Route
                  path="/newdraft"
                  element={
                    <StyledEngineProvider injectFirst>
                      <ThemeProvider theme={CSCtheme}>
                        <WizardAddObjectStep />
                      </ThemeProvider>
                    </StyledEngineProvider>
                  }
                />
              </Routes>
            </Provider>
          </MemoryRouter>
        )
        expect(screen.getByTestId(typeName)).toBeInTheDocument()
      })
    })
  })
})
