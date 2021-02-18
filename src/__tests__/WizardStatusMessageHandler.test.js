import React from "react"

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardStatusMessageHandler from "../components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"

import { WizardStatus } from "constants/wizardStatus"

const mockStore = configureStore([])

describe("WizardStatusMessageHandler", () => {
  const store = mockStore({
    errorMessage: "",
  })

  it("should render error message", () => {
    const responseMock = { data: { accessionId: "TESTID1234", status: 504 } }
    const prefixTextMock = "Test prefix"
    render(
      <Provider store={store}>
        <WizardStatusMessageHandler
          successStatus={WizardStatus.error}
          response={responseMock}
          prefixText={prefixTextMock}
        />
      </Provider>
    )
    expect(screen.getByRole("alert")).toBeDefined()
    expect(screen.getByText(/Unfortunately an unexpected error happened on our servers/i)).toBeDefined()
  })

  it("should render info message", () => {
    render(
      <Provider store={store}>
        <WizardStatusMessageHandler successStatus={WizardStatus.info} />
      </Provider>
    )
    expect(
      screen.getByText(/For some reason, your file is still being saved to our database, please wait./i)
    ).toBeDefined()
  })

  it("should render success message", () => {
    const responseMock = { data: { accessionId: "TESTID1234" }, config: { baseURL: "/drafts" } }
    render(
      <Provider store={store}>
        <WizardStatusMessageHandler response={responseMock} successStatus={WizardStatus.success} />
      </Provider>
    )
    expect(screen.getByText(/Draft saved with accessionid TESTID1234/i)).toBeDefined()
  })
})
