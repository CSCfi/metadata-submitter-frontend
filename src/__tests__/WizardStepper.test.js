import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, cleanup, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardStepper from "../components/NewDraftWizard/WizardComponents/WizardStepper"

const mockStore = configureStore([])

afterEach(cleanup)

describe("WizardStepper", () => {
  const store = mockStore({
    submissionType: "",
    wizardStep: 0,
  })
  it("should take a snapshot", () => {
    const wrapper = (
      <Provider store={store}>
        <WizardStepper />
      </Provider>
    )
    const { asFragment } = render(wrapper)
    expect(asFragment(wrapper)).toMatchSnapshot()
  })

  it("should have back-step button disabled when wizardStep is 0", () => {
    const wrapper = (
      <Provider store={store}>
        <WizardStepper />
      </Provider>
    )
    const { getByText } = render(wrapper)
    expect(getByText("Back").closest("Button")).toHaveClass("Mui-disabled")
  })

  it("should add to wizardStep store item on next-button click", () => {
    const wrapper = (
      <Provider store={store}>
        <WizardStepper createFolderFormRef={[]} />
      </Provider>
    )
    const { getByText } = render(wrapper)
    // fireEvent.click(getByText("Next").closest("Button"))
    const button = getByText("Next").closest("Button")
    screen.debug(button)
    // console.log(button)
    // fireEvent.click(button)
    // // expect(button).toHaveBeenCalled()
    // expect(store.wizardStep).toBe(1)
  })
})
