import React from "react"

import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter } from "react-router"

import App from "App"
import { renderWithProviders } from "utils/test-utils"

const restHandlers = [
  http.get("/v1/users/current", () => {
    return HttpResponse.json({
      userId: "001",
      name: "Test User",
      projects: [
        { projectId: "PROJECT1", projectNumber: "Project 1" },
        { projectId: "PROJECT2", projectNumber: "Project 2" },
      ],
    })
  }),
]

const server = setupServer(...restHandlers)

describe("HomePage", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  beforeEach(() => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/en/home"]}>
        <App />
      </MemoryRouter>
    )
  })

  test("should render its content correctly", () => {
    expect(screen.getByTestId("all-tab")).toBeInTheDocument()
    expect(screen.getByTestId("draft-tab")).toBeInTheDocument()
    expect(screen.getByTestId("published-tab")).toBeInTheDocument()
    expect(screen.getByTestId("link-create-submission")).toBeInTheDocument()
  })
})
