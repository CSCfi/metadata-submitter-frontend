import { screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { vi } from "vitest"

import App from "App"
import { renderWithProviders } from "utils/test-utils"
import Page401 from "views/ErrorPages/Page401"

describe("Page401", () => {
  test("renders Page401 component", () => {
    renderWithProviders(<Page401 />)
    expect(screen.getByText("401 – NOT LOGGED IN")).toBeInTheDocument()
    expect(screen.getByTestId("401text")).toBeInTheDocument()
  })

  test("redirects to Main Page after 10s", () => {
    vi.useFakeTimers()

    const component = renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/error401" }]}>
        <App />
      </MemoryRouter>
    )

    expect(component.getByText("401 – NOT LOGGED IN")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(component.getByTestId("login-button")).toBeInTheDocument()
    vi.useRealTimers()
  })
})
