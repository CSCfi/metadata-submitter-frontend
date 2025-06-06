import { act } from "react"

import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter } from "react-router"
import { vi } from "vitest"

import App from "App"
import { renderWithProviders } from "utils/test-utils"
import Page403 from "views/ErrorPages/Page403"

const restHandlers = [
  http.get("/v1/users", () => {
    return HttpResponse.json({
      userId: "001",
      name: "Test User",
      projects: [{ projectId: "PROJECT1" }, { projectId: "PROJECT2" }],
    })
  }),
]

const server = setupServer(...restHandlers)

describe("Page403", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test("renders Page403 component", () => {
    renderWithProviders(<Page403 />)
    expect(screen.getByText("403 – FORBIDDEN")).toBeInTheDocument()
    expect(screen.getByTestId("403text")).toBeInTheDocument()
  })

  test("redirects to Home Page after 10s", () => {
    vi.useFakeTimers()
    act(() => {
      renderWithProviders(
        <MemoryRouter initialEntries={[{ pathname: "/error403" }]}>
          <App />
        </MemoryRouter>
      )
    })
    expect(screen.getByText("403 – FORBIDDEN")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByTestId("all-tab")).toBeInTheDocument()
    vi.useRealTimers()
  })
})
