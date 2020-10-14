import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardFooter from "../components/NewDraftWizard/WizardComponents/WizardFooter"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardStepper", () => {
  let store
  let wrapper

  beforeEach(() => {
    store = mockStore({
      submissionType: "form",
      wizardStep: 1,
    })
    wrapper = (
      <BrowserRouter>
        <Provider store={store}>
          <WizardFooter />
        </Provider>
      </BrowserRouter>
    )
  })

  it("should open dialog on click of cancel", () => {
    const { asFragment } = render(wrapper)
    const firstRender = asFragment()
    const button = screen.getByRole("button", { name: /Cancel/i })
    fireEvent.click(button)
    expect(firstRender).toMatchDiffSnapshot(asFragment())
  })
})
