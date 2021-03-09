import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardShowSummaryStep from "../components/NewDraftWizard/WizardSteps/WizardShowSummaryStep"
import CSCtheme from "../theme"

import { ObjectTypes } from "constants/wizardObject"

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
          { accessionId: "EDAG2584421211413887", schema: ObjectTypes.study },
          { accessionId: "EDAG9880663174234413", schema: ObjectTypes.study },
        ],
        name: "AA",
        published: false,
      },
    })
    wrapper = (
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <WizardShowSummaryStep />
        </ThemeProvider>
      </Provider>
    )
  })

  it("should have uploaded objects listed", async () => {
    render(wrapper)
    const items = await screen.findAllByRole("button")
    expect(items).toHaveLength(8) // Screen renders stepper back and next buttons and object actions
  })
})
