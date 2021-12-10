import React from "react"

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardAlert from "../components/NewDraftWizard/WizardComponents/WizardAlert"

import { ObjectSubmissionsArray } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardAlert", () => {
  const store = mockStore({
    submissionType: "",
  })

  it("should render appropriate dialogs", () => {
    const alerts = [
      { location: "submission", types: ObjectSubmissionsArray },
      { location: "footer", types: ["cancel", "save"] },
      { location: "stepper", types: ObjectSubmissionsArray },
    ]
    alerts.forEach((alert: any) => {
      alert.types.forEach((type: string) => {
        render(
          <BrowserRouter>
            <Provider store={store}>
              <WizardAlert alertType={type} parentLocation={Object.keys(alert)[0]} onAlert={() => ({})} />
            </Provider>
          </BrowserRouter>
        )
        expect(screen.getByRole("dialog")).toBeDefined()
      })
    })
  })
})