import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardShowSummaryStep from "../components/NewDraftWizard/WizardSteps/WizardShowSummaryStep"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardShowSummaryStep", () => {
  let store
  let wrapper

  beforeEach(() => {
    store = mockStore({
      submissionFolder: {
        description: "AWD",
        id: "FOL90524783",
        metadataObjects: [
          { accessionId: "EDAG2584421211413887", schema: "study" },
          { accessionId: "EDAG9880663174234413", schema: "study" },
        ],
        name: "AA",
        published: false,
      },
    })
    wrapper = (
      <Provider store={store}>
        <WizardShowSummaryStep />
      </Provider>
    )
  })

  it("should objects listed", async () => {
    render(wrapper)
    const items = await screen.findAllByRole("button")
    expect(items).toHaveLength(4) // Screen gets back and next buttons also
  })
})
