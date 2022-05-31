import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardShowSummaryStep from "../components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardShowSummaryStep", () => {
  let store
  let wrapper

  const submittedObjects = [
    {
      accessionId: "a971460fc54340ae8b16a617cd7d46be",
      schema: ObjectTypes.study,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test study title",
      },
    },
    {
      accessionId: "3830b4425c7b47c4abd930a85c1f63bb",
      schema: ObjectTypes.dac,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test DAC title",
      },
    },
    {
      accessionId: "bd467672bf2949439b193f9b6c95ea42",
      schema: ObjectTypes.policy,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test policy title",
      },
    },
    {
      accessionId: "85b8f23048ea4ac69084eb7f57a6774c",
      schema: ObjectTypes.sample,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test sample title",
      },
    },
    {
      accessionId: "572da0179be748bcb26e8af3773cf81e",
      schema: ObjectTypes.experiment,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test experiment title",
      },
    },
    {
      accessionId: "80ebcbca98cf49cb9b794c65a9b9f99e",
      schema: ObjectTypes.run,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test run title",
      },
    },
    {
      accessionId: "7eb7696625414f70b8eab2a5aab2ceeb",
      schema: ObjectTypes.analysis,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test analysis title",
      },
    },
    {
      accessionId: "bfc47b455a0e4fe3a9db11f4ac77449d",
      schema: ObjectTypes.dataset,
      tags: {
        submissionType: ObjectSubmissionTypes.form,
        displayTitle: "Test Dataset title",
      },
    },
  ]

  beforeEach(() => {
    store = mockStore({
      objectTypesArray: [
        ObjectTypes.study,
        ObjectTypes.dac,
        ObjectTypes.policy,
        ObjectTypes.sample,
        ObjectTypes.experiment,
        ObjectTypes.run,
        ObjectTypes.analysis,
        ObjectTypes.dataset,
      ],
      submission: {
        submissionId: "FOL90524783",
        name: "Test folder",
        description: "Description for folder",
        projectId: "a0981b1b4df349e5af7ecbe22a1a1f75",
        published: false,
        metadataObjects: submittedObjects,
        drafts: [],
      },
    })
    wrapper = (
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=2" }]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/submission"
              element={
                <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={CSCtheme}>
                    <WizardShowSummaryStep />
                  </ThemeProvider>
                </StyledEngineProvider>
              }
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    )
    render(wrapper)
  })

  it("should have all objects listed", async () => {
    const items = await screen.findAllByTestId("summary-item")
    expect(items).toHaveLength(submittedObjects.length + 1) // Additional item for folder details
  })

  it("should render objects from 2nd step in own section", () => {
    expect(screen.getByText("2. Study, DAC and Policy")).toBeInTheDocument()

    const secondStep = screen.getByTestId("summary-step-2")
    expect(secondStep).toBeInTheDocument()

    const allowedObjectTypes = [ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy]

    const filteredItems = submittedObjects.filter(item => allowedObjectTypes.indexOf(item.schema) > -1)

    // Step should contain one object for each object type
    const { getAllByTestId } = within(secondStep)
    const stepItems = getAllByTestId("summary-item")
    expect(stepItems.length).toBe(filteredItems.length)
  })
})
