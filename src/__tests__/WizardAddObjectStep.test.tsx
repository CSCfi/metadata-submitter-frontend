import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectSubmissionsArray, ObjectTypes } from "constants/wizardObject"
import { Schema } from "types"
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
          objectTypesArray: [
            ObjectTypes.study,
            ObjectTypes.sample,
            ObjectTypes.experiment,
            ObjectTypes.run,
            ObjectTypes.analysis,
            ObjectTypes.dac,
            ObjectTypes.policy,
            ObjectTypes.dataset,
          ] as Schema[],
          submissionType: ObjectSubmissionTypes.xml,
          submission: {
            name: "submission name",
            description: "submission description",
            published: false,
            metadataObjects: [],
            submissionId: "FOL12341234",
            drafts: [
              {
                accessionId: "TESTID1234",
                schema: ObjectTypes.study,
                tags: {},
              },
            ],
            workflow: "FEGA",
            doiInfo: { creators: [], contributors: [], subjects: [] },
          },
          currentObject: {
            objectId: "",
            tags: {
              fileName: "Test XML file",
              fileSize: "1",
            },
            accessionId: "TESTID0000",
            lastModified: "",
            objectType: "",
            status: "",
            title: "",
            submissionType: "",
            cleanedValues: {
              accessionId: "TESTID0000",
              lastModified: "",
              objectType: "",
              status: "",
              title: "",
              submissionType: "",
            },
            index: 1,
          },
          openedXMLModal: false,
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
              objectTypesArray: [
                ObjectTypes.study,
                ObjectTypes.sample,
                ObjectTypes.experiment,
                ObjectTypes.run,
                ObjectTypes.analysis,
                ObjectTypes.dac,
                ObjectTypes.policy,
                ObjectTypes.dataset,
              ] as Schema[],
              submissionType: typeName,
              submission: {
                submissionId: "FOL12341234",
                name: "Testname",
                description: "Test",
                published: false,
                metadataObjects: [],
                drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study, tags: {} }],
                workflow: "",
                doiInfo: { creators: [], contributors: [], subjects: [] },
              },
              currentObject: {
                accessionId: "TESTID0000",
                lastModified: "",
                objectType: "",
                status: "",
                title: "",
                submissionType: "",
                objectId: "",
                tags: {
                  fileName: "Test XML file",
                  fileSize: "1",
                },
                cleanedValues: {
                  accessionId: "TESTID0000",
                  lastModified: "",
                  objectType: "",
                  status: "",
                  title: "",
                  submissionType: "",
                },
                index: 1,
              },
              openedXMLModal: false,
            },
          }
        )
      )
      expect(screen.getByTestId(typeName)).toBeInTheDocument()
    })
  })
})
