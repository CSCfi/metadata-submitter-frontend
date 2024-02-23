import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { createRoot } from "react-dom/client"
import { act } from "react-dom/test-utils"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
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
      submission: {
        name: "submission name",
        description: "submission description",
        published: false,
        metadataObjects: [],
        id: "FOL12341234",
        drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study }],
      },
      currentObject: {
        accessionId: "TESTID0000",
        tags: {
          fileName: "Test XML file",
          fileSize: 1,
        },
      },
      openedXMLModal: false,
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
        <Provider store={store}>
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
        </Provider>
      </MemoryRouter>
    )
    expect(screen.getByText("Add objects by clicking the name, then fill form or upload XML File.")).toBeInTheDocument()
  })

  test("should render appropriate card", async () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

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
        submission: {
          description: "Test",
          id: "FOL12341234",
          name: "Testname",
          published: false,
          drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study }],
        },
        currentObject: {
          accessionId: "TESTID0000",
          tags: {
            fileName: "Test XML file",
            fileSize: 1,
          },
        },
        openedXMLModal: false,
      })

      act(() =>
        root.render(
          <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
            <Provider store={store}>
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
            </Provider>
          </MemoryRouter>
        )
      )
      expect(screen.getByTestId(typeName)).toBeInTheDocument()
    })
  })
})
