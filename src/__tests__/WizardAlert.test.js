import React from "react"

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardAlert from "../components/NewDraftWizard/WizardComponents/WizardAlert"

const mockStore = configureStore([])

describe("WizardAlert", () => {
  const store = mockStore({
    submissionType: "",
  })

  it("should render appropriate dialogs", () => {
    const alerts = [
      { submission: { types: ["form", "xml", "existing"] } },
      { footer: { types: ["cancel", "save"] } },
      { stepper: { types: ["form", "xml", "existing"] } },
    ]
    alerts.forEach(item => {
      item[Object.keys(item)].types.forEach(type => {
        render(
          <BrowserRouter>
            <Provider store={store}>
              <WizardAlert alertType={type} parentLocation={Object.keys(item)[0]} onAlert="true" />
            </Provider>
          </BrowserRouter>
        )
        expect(screen.getByRole("dialog")).toBeDefined()
      })
    })
  })
})
