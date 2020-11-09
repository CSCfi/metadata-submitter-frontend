import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardSavedObjectsList from "../components/NewDraftWizard/WizardComponents/WizardSavedObjectsList"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  const store = mockStore({
    submissionType: "sample",
    wizardStep: 1,
  })

  const submissions = [
    { accessionId: "EDAG1", schema: "sample" },
    { accessionId: "EDAG2", schema: "sample" },
  ]

  it("should have 'Added!' message rendered on item that has 'new' property", () => {
    render(
      <Provider store={store}>
        <WizardSavedObjectsList submissions={submissions} submissionType="sample" />
      </Provider>
    )
    submissions.forEach(item => {
      expect(screen.getByText(item.accessionId)).toBeInTheDocument()
    })
  })
})
