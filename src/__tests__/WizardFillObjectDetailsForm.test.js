import React from "react"

require("jest-localstorage-mock")
import "@testing-library/jest-dom/extend-expect"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardFillObjectDetailsForm from "../components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"

const mockStore = configureStore([])

describe("WizardFillObjectDetailsForm", () => {
  const schema = {
    title: "Study",
    type: "object",
    required: ["descriptor"],
    properties: {
      descriptor: {
        type: "object",
        title: "Study Description",
        required: ["studyTitle"],
        properties: {
          studyTitle: {
            title: "Study Title",
            description: "Title of the study as would be used in a publication.",
            type: "string",
          },
        },
      },
    },
  }

  const store = mockStore({
    objectType: "study",
    submissionType: "form",
    submissionFolder: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
    },
  })

  localStorage.__STORE__["cached_study_schema"] = JSON.stringify(schema)

  it("should create study form from schema in localStorage", async () => {
    render(
      <Provider store={store}>
        <WizardFillObjectDetailsForm />
      </Provider>
    )
    expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    await waitFor(() => screen.getByText("Study Description"))
    expect(screen.getByText("Study Description")).toBeDefined()
  })
})
