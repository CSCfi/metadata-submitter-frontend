import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Route } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardStepper from "../components/NewDraftWizard/WizardComponents/WizardStepper"

import { ObjectSubmissionTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  it("should have back-step button disabled on first step", () => {
    const store = mockStore({
      submissionType: "",
    })
    render(
      <MemoryRouter initialEntries={["/newdraft/0"]}>
        <Provider store={store}>
          <Route path="/newdraft/:step">
            <WizardStepper />
          </Route>
        </Provider>
      </MemoryRouter>
    )
    const button = screen.getByRole("button", { name: /Back/i })
    expect(button).toHaveAttribute("disabled")
  })
  it("should open dialog if form or upload in progress", () => {
    const store = mockStore({
      submissionType: ObjectSubmissionTypes.form,
      draftStatus: "notSaved",
    })
    render(
      <MemoryRouter initialEntries={["/newdraft/1"]}>
        <Provider store={store}>
          <Route path="/newdraft/:step">
            <WizardStepper />
          </Route>
        </Provider>
      </MemoryRouter>
    )
    const button = screen.getByRole("button", { name: /Back/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined
  })
})
