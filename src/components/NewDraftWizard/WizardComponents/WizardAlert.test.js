import React from "react"

import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import { mount } from "../../../../enzyme"

import WizardAlert from "./WizardAlert"

const mockStore = configureStore([])

describe("WizardAlert", () => {
  const store = mockStore({
    subMissionType: "",
  })
  it("should render appropriate dialogs", () => {
    const alerts = [
      { submission: { types: ["form", "xml", "existing"] } },
      { footer: { types: ["cancel", "save"] } },
      { stepper: { types: ["form", "xml", "existing"] } },
    ]
    alerts.forEach(item => {
      item[Object.keys(item)].types.forEach(type => {
        const wrapper = mount(
          <BrowserRouter>
            <Provider store={store}>
              <WizardAlert alertType={type} parentLocation={Object.keys(item)[0]} onAlert="true" />
            </Provider>
          </BrowserRouter>
        )
        expect(wrapper.find("ForwardRef(Dialog)").length).toBe(1)
      })
    })
  })
})
