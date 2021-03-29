import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { Route, MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import WizardFooter from "../components/NewDraftWizard/WizardComponents/WizardFooter"

import { ObjectSubmissionTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardFooter", () => {
  let store
  let wrapper

  it("should open dialog on click of cancel", () => {
    store = mockStore({
      submissionType: ObjectSubmissionTypes.form,
    })

    wrapper = (
      <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "step=1" }]}>
        <Provider store={store}>
          <Route path="/newdraft">
            <WizardFooter />
          </Route>
        </Provider>
      </MemoryRouter>
    )
    render(wrapper)
    const button = screen.getByRole("button", { name: /Cancel/i })
    fireEvent.click(button)
    expect(screen.getByRole("dialog")).toBeDefined()
  }),
    it("should disable Publish button if there is no submitted objects", () => {
      store = mockStore({
        submissionType: ObjectSubmissionTypes.form,
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
        <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "step=1" }]}>
          <Provider store={store}>
            <Route path="/newdraft">
              <WizardFooter />
            </Route>
          </Provider>
        </MemoryRouter>
      )

      render(wrapper)
      const publishButton = screen.getByRole("button", { name: /Publish/i })
      expect(publishButton).toBeDisabled()
    })
})
