import React from "react"

import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import { shallow, mount } from "../../../../enzyme"

import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

const mockStore = configureStore([])

describe("WizardStatusMessageHandler", () => {
  const store = mockStore({
    errorMessage: "",
  })
  it("should render appropriate components", () => {
    const statusList = ["error", "info", "success"]
    statusList.forEach(status => {
      const wrapper = shallow(<WizardStatusMessageHandler successStatus={status} />)
      expect(wrapper.find(status.charAt(0).toUpperCase() + status.slice(1) + "Handler").length).toBe(1)
    })
  })

  it("should open snackbar on error message", () => {
    const wrapper = mount(
      <Provider store={store}>
        <WizardStatusMessageHandler response={{ status: 504 }} successStatus="error" />
      </Provider>
    )
    expect(wrapper.find("ForwardRef(Snackbar)").length).toBe(1)
  })
})
