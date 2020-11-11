import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, act } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/NewDraftWizard/WizardSteps/WizardAddObjectStep"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  it("should not render any cards if no selected object type", () => {
    const store = mockStore({
      objectType: "",
      submissionType: "xml",
      submissionFolder: {
        name: "folder name",
        description: "folder description",
        published: false,
        metadataObjects: [],
        id: "FOL12341234",
      },
    })
    render(
      <Provider store={store}>
        <WizardAddObjectStep />
      </Provider>
    )
    expect(screen.getByText("Add objects by clicking the name, then fill form or upload XML File.")).toBeInTheDocument()
  })

  it("should render appropriate card", async () => {
    const typeList = ["form", "xml", "existing"]
    await act(async () => {
      typeList.forEach(typeName => {
        const store = mockStore({
          objectType: "study",
          submissionType: typeName,
          submissionFolder: {
            description: "Test",
            id: "FOL12341234",
            name: "Testname",
            published: false,
          },
        })
        render(
          <Provider store={store}>
            <WizardAddObjectStep />
          </Provider>
        )
        expect(screen.getByTestId(typeName)).toBeInTheDocument()
      })
    })
  })
})
