import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardFooter from "../components/NewDraftWizard/WizardComponents/WizardFooter"

import { SubmissionTypes } from "constants/submissions"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  let store
  let wrapper

  it("should open dialog on click of cancel", () => {
    store = mockStore({
      submissionType: SubmissionTypes.form,
      wizardStep: 1,
    })
    wrapper = (
      <BrowserRouter>
        <Provider store={store}>
          <WizardFooter />
        </Provider>
      </BrowserRouter>
    )
    render(wrapper)
    const button = screen.getByRole("button", { name: /Cancel/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined()
  }),
    it("should disable Publish button if there is no submitted objects", () => {
      store = mockStore({
        submissionType: SubmissionTypes.form,
        wizardStep: 2,
        submissionFolder: {
          id: "FOL001",
          name: "Test folder",
          description: "Test folder",
          published: false,
          drafts: [],
          metadataObjects: [],
        },
      })

      wrapper = (
        <BrowserRouter>
          <Provider store={store}>
            <WizardFooter />
          </Provider>
        </BrowserRouter>
      )

      render(wrapper)
      const publishButton = screen.getByRole("button", { name: /Publish/i })
      expect(publishButton).toBeDisabled()
    })
})
