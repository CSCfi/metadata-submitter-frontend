import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardStepper from "../components/NewDraftWizard/WizardComponents/WizardStepper"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  it("should have back-step button disabled on first step", () => {
    const store = mockStore({
      submissionType: "",
      wizardStep: 0,
    })
    render(
      <Provider store={store}>
        <WizardStepper />
      </Provider>
    )
    const button = screen.getByRole("button", { name: /Back/i })
    expect(button).toHaveAttribute("disabled")
  })
  it("should open dialog if form or upload in progress", () => {
    const store = mockStore({
      submissionType: "form",
      wizardStep: 1,
      draftStatus: "notSaved",
    })
    render(
      <Provider store={store}>
        <WizardStepper />
      </Provider>
    )
    const button = screen.getByRole("button", { name: /Back/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined
  })
})
