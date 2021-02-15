import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardSavedObjectsList from "../components/NewDraftWizard/WizardComponents/WizardSavedObjectsList"

import { SubmissionTypes } from "constants/submissions"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  const store = mockStore({
    objectType: "sample",
    wizardStep: 1,
  })

  const submissions = [
    { accessionId: "EDAG1", schema: "sample", tags: { submissionType: SubmissionTypes.form } },
    { accessionId: "EDAG2", schema: "sample", tags: { submissionType: SubmissionTypes.form } },
    { accessionId: "EDAG3", schema: "sample", tags: { submissionType: SubmissionTypes.existing } },
  ]

  beforeEach(() => {
    render(
      <Provider store={store}>
        <WizardSavedObjectsList submissions={submissions} />
      </Provider>
    )
  })

  it("should have saved objects listed", () => {
    submissions.forEach(item => {
      expect(screen.getByText(item.accessionId)).toBeInTheDocument()
    })
  })

  it("should have correct amount of submitted forms", () => {
    screen.getByText(/Submitted sample form/i)
    expect(screen.getByText(/Submitted sample form/i)).toBeInTheDocument()

    const formList = screen.getByRole("list", { name: SubmissionTypes.form })
    expect(formList).toBeInTheDocument()

    const { getAllByRole } = within(formList)
    const submittedForms = getAllByRole("listitem")
    expect(submittedForms.length).toBe(1)
  })

  it("should have correct amount of submitted forms", () => {
    screen.getByText(/Submitted sample xml/i)
    expect(screen.getByText(/Submitted sample xml/i)).toBeInTheDocument()

    const xmlList = screen.getByRole("list", { name: SubmissionTypes.xml })
    expect(xmlList).toBeInTheDocument()

    const { getAllByRole } = within(xmlList)
    const submittedXML = getAllByRole("listitem")
    expect(submittedXML.length).toBe(2)
  })
})
