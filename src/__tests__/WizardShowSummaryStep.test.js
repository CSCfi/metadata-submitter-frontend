import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Route } from "react-router-dom"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardShowSummaryStep from "../components/NewDraftWizard/WizardSteps/WizardShowSummaryStep"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardShowSummaryStep", () => {
  let store
  let wrapper

  beforeEach(() => {
    store = mockStore({
      objectsArray: [
        ObjectTypes.study,
        ObjectTypes.sample,
        ObjectTypes.experiment,
        ObjectTypes.run,
        ObjectTypes.analysis,
        ObjectTypes.dac,
        ObjectTypes.policy,
        ObjectTypes.dataset,
      ],
      submissionFolder: {
        description: "AWD",
        id: "FOL90524783",
        metadataObjects: [
          {
            accessionId: "EDAG2584421211413887",
            schema: ObjectTypes.study,
            tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: "Study form 1" },
          },
          {
            accessionId: "EDAG9880663174234413",
            schema: ObjectTypes.study,
            tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: "Study form 2" },
          },
          {
            accessionId: "EDAG9880663174452110",
            schema: ObjectTypes.sample,
            tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: "Sample form 1" },
          },
          {
            accessionId: "EDAG9880660036513985",
            schema: ObjectTypes.dac,
            tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: "John Smith" },
          },
        ],
        name: "AA",
        published: false,
      },
    })
    wrapper = (
      <MemoryRouter initialEntries={["/newdraft/step2"]}>
        <Provider store={store}>
          <Route path="/newdraft/:step">
          <ThemeProvider theme={CSCtheme}>
            <WizardShowSummaryStep />
          </ThemeProvider>
          </Route>
        </Provider>
      </MemoryRouter>
    )
    render(wrapper)
  })

  it("should have uploaded objects listed", async () => {
    const items = await screen.findAllByRole("list")
    expect(items).toHaveLength(8) // Screen renders stepper back and next buttons and object actions
  })

  it("should renders Study list correctly", () => {
    const formList = screen.getByRole("list", { name: ObjectTypes.study })
    expect(formList).toBeInTheDocument()

    const { getAllByRole } = within(formList)
    const submittedForm = getAllByRole("listitem")
    expect(submittedForm.length).toBe(2)

    // Expect to render both Study titles and accessionIds
    expect(submittedForm[0]).toHaveTextContent("Study form 1")
    expect(submittedForm[0]).toHaveTextContent("EDAG2584421211413887")
    expect(submittedForm[1]).toHaveTextContent("Study form 2")
    expect(submittedForm[1]).toHaveTextContent("EDAG9880663174234413")
  })

  it("should renders Sample list correctly", () => {
    const formList = screen.getByRole("list", { name: ObjectTypes.sample })
    expect(formList).toBeInTheDocument()

    const { getAllByRole } = within(formList)
    const submittedForm = getAllByRole("listitem")
    expect(submittedForm.length).toBe(1)

    // Expect to render Sample title and accessionId
    expect(submittedForm[0]).toHaveTextContent("Sample form 1")
    expect(submittedForm[0]).toHaveTextContent("EDAG9880663174452110")
  })

  it("should renders DAC list correctly", () => {
    const formList = screen.getByRole("list", { name: ObjectTypes.dac })
    expect(formList).toBeInTheDocument()

    const { getAllByRole } = within(formList)
    const submittedForm = getAllByRole("listitem")
    expect(submittedForm.length).toBe(1)

    // Expect to render Sample title and accessionId
    expect(submittedForm[0]).toHaveTextContent("Main Contact: John Smith")
    expect(submittedForm[0]).toHaveTextContent("EDAG9880660036513985")
  })
})
