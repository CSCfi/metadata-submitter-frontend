import React from "react"

import { screen } from "@testing-library/react"

import StatusMessageHandler from "../components/StatusMessageHandler"

import { ResponseStatus } from "constants/responseStatus"
import { renderWithProviders } from "utils/test-utils"

describe("StatusMessageHandler", () => {
  it("should render error message", () => {
    const responseMock = { data: { accessionId: "TESTID1234", status: 504 } }
    const helperTextMock = "Test prefix"

    renderWithProviders(<StatusMessageHandler />, {
      preloadedState: {
        statusDetails: {
          status: ResponseStatus.error,
          response: responseMock,
          helperText: helperTextMock,
        },
      },
    })
    expect(screen.getByRole("alert")).toBeDefined()
    expect(
      screen.getByText(/Unfortunately an unexpected error happened on our servers/i)
    ).toBeDefined()
  })

  it("should render info message", () => {
    renderWithProviders(<StatusMessageHandler />, {
      preloadedState: {
        statusDetails: {
          status: ResponseStatus.info,
        },
      },
    })
    expect(
      screen.getByText(
        /For some reason, your file is still being saved to our database, please wait./i
      )
    ).toBeDefined()
  })

  it("should render success message", () => {
    const responseMock = { data: { accessionId: "TESTID1234" }, config: { baseURL: "/v1/drafts" } }

    renderWithProviders(<StatusMessageHandler />, {
      preloadedState: {
        statusDetails: {
          status: ResponseStatus.success,
          response: responseMock,
        },
      },
    })
    expect(screen.getByText(/Draft saved successfully/i)).toBeDefined()
  })
})
