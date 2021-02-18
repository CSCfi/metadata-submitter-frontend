import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardObjectIndex from "../components/NewDraftWizard/WizardComponents/WizardObjectIndex"

import { ObjectTypes } from "constants/object"

const mockStore = configureStore([])

describe("WizardObjectIndex", () => {
  it("should render badge with number correctly", () => {
    const store = mockStore({
      submissionFolder: {
        drafts: [
          { accessionId: "TESTID1234", schema: `draft-${ObjectTypes.study}` },
          { accessionId: "TESTID5678", schema: `draft-${ObjectTypes.study}` },
          { accessionId: "TESTID0101", schema: `draft-${ObjectTypes.analysis}` },
          { accessionId: "TESTID0202", schema: `draft-${ObjectTypes.experiment}` },
        ],
      },
    })
    render(
      <Provider store={store}>
        <WizardObjectIndex />
      </Provider>
    )
    const badge = screen.queryAllByTestId("badge")
    expect(badge).toHaveLength(8)
    const studyBadge = screen.queryAllByTestId("badge")[0]
    expect(studyBadge).toHaveTextContent(2)
    const analysisBadge = screen.queryAllByTestId("badge")[4]
    expect(analysisBadge).toHaveTextContent(1)
    const experimentBadge = screen.queryAllByTestId("badge")[2]
    expect(experimentBadge).toHaveTextContent(1)
  })
})
