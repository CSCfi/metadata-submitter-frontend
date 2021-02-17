import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, act } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/NewDraftWizard/WizardSteps/WizardAddObjectStep"

import { ObjectTypes } from "constants/objects"
import { SubmissionTypes, SubmissionsArray } from "constants/submissions"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  it("should not render any cards if no selected object type", () => {
    const store = mockStore({
      objectType: "",
      submissionType: SubmissionTypes.xml,
      submissionFolder: {
        name: "folder name",
        description: "folder description",
        published: false,
        metadataObjects: [],
        id: "FOL12341234",
        drafts: [{ accessionId: "TESTID1234", schema: "study" }],
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
    await act(async () => {
      SubmissionsArray.forEach(typeName => {
        const store = mockStore({
          objectType: ObjectTypes.study,
          submissionType: typeName,
          submissionFolder: {
            description: "Test",
            id: "FOL12341234",
            name: "Testname",
            published: false,
            drafts: [{ accessionId: "TESTID1234", schema: "study" }],
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
