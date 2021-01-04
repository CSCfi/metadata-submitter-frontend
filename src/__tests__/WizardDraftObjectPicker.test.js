import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardDraftObjectPicker from "../components/NewDraftWizard/WizardComponents/WizardDraftObjectPicker"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardStepper", () => {
  const store = mockStore({
    objectType: "study",
    submissionType: "existing",
    submissionFolder: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      drafts: [
        { accessionId: "TESTID1", schema: "draft-study" },
        { accessionId: "TESTID2", schema: "draft-study" },
        { accessionId: "TESTID3", schema: "draft-sample" },
      ],
    },
  })

  it("should have drafts listed for selected object type", async () => {
    render(
      <Provider store={store}>
        <WizardDraftObjectPicker />
      </Provider>
    )
    expect(screen.getAllByRole("button")).toHaveLength(4)
  })
})
