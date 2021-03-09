import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import WizardDraftObjectPicker from "../components/NewDraftWizard/WizardComponents/WizardDraftObjectPicker"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("WizardStepper", () => {
  const store = mockStore({
    objectType: ObjectTypes.study,
    submissionType: ObjectSubmissionTypes.existing,
    submissionFolder: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      drafts: [
        { accessionId: "TESTID1", schema: `draft-${ObjectTypes.study}` },
        { accessionId: "TESTID2", schema: `draft-${ObjectTypes.study}` },
        { accessionId: "TESTID3", schema: `draft-${ObjectTypes.sample}` },
      ],
    },
  })

  it("should have drafts listed for selected object type", async () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <WizardDraftObjectPicker />
        </ThemeProvider>
      </Provider>
    )
    expect(screen.getAllByRole("button")).toHaveLength(4)
  })
})
