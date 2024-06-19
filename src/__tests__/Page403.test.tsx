import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { act } from "react-dom/test-utils"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"

import CSCtheme from "../theme"

import App from "App"
import { renderWithProviders } from "utils/test-utils"
import Page403 from "views/ErrorPages/Page403"

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

describe("Page403", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test("renders Page403 component", () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page403 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    expect(screen.getByText("403 – Forbidden")).toBeInTheDocument()
    expect(screen.getByTestId("403text")).toBeInTheDocument()
  })

  test("redirects to Home Page after 10s", () => {
    vi.useFakeTimers()
    act(() => {
      renderWithProviders(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <MemoryRouter initialEntries={[{ pathname: "/error403" }]}>
              <App />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      )
    })
    expect(screen.getByText("403 – Forbidden")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByTestId("all-tab")).toBeInTheDocument()
    vi.useRealTimers()
  })
})
