import React from "react"

import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import StatusMessageHandler from "../components/StatusMessageHandler"

import { ResponseStatus } from "constants/responseStatus"

const mockStore = configureStore([])

describe("StatusMessageHandler", () => {
  it("should render error message", () => {
    const responseMock = { data: { accessionId: "TESTID1234", status: 504 } }
    const helperTextMock = "Test prefix"

    const store = mockStore({
      statusDetails: { status: ResponseStatus.error, response: responseMock, helperText: helperTextMock },
    })

    render(
      <Provider store={store}>
        <StatusMessageHandler />
      </Provider>
    )
    expect(screen.getByRole("alert")).toBeDefined()
    expect(screen.getByText(/Unfortunately an unexpected error happened on our servers/i)).toBeDefined()
  })

  it("should render info message", () => {
    const store = mockStore({
      statusDetails: { status: ResponseStatus.info },
    })

    render(
      <Provider store={store}>
        <StatusMessageHandler />
      </Provider>
    )
    expect(
      screen.getByText(/For some reason, your file is still being saved to our database, please wait./i)
    ).toBeDefined()
  })

  it("should render success message", () => {
    const responseMock = { data: { accessionId: "TESTID1234" }, config: { baseURL: "/v1/drafts" } }

    const store = mockStore({
      statusDetails: { status: ResponseStatus.success, response: responseMock },
    })

    render(
      <Provider store={store}>
        <StatusMessageHandler />
      </Provider>
    )
    expect(screen.getByText(/Draft saved with accessionid TESTID1234/i)).toBeDefined()
  })
})
