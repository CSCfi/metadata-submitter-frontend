import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/NewDraftWizard/WizardSteps/WizardAddObjectStep"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  let store
  let wrapper

  beforeEach(() => {
    store = mockStore({
      objectType: "sample",
      submissionType: "xml",
      submissionFolder: {
        name: "folder name",
        description: "folder description",
        published: false,
        metadataObjects: [],
        id: "FOL12341234",
      },
    })
    wrapper = (
      <Provider store={store}>
        <WizardAddObjectStep />
      </Provider>
    )
  })

  it("should render XML upload card", () => {
    const { asFragment } = render(wrapper)
    const card = screen.getByText("Upload XML file")
    expect(asFragment(wrapper)).toMatchSnapshot()
    expect(card).toBeDefined()
  })
})
