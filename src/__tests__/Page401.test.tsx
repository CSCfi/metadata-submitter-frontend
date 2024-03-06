import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import CSCtheme from "../theme"

import App from "App"
import { renderWithProviders } from "utils/test-utils"
import Page401 from "views/ErrorPages/Page401"

describe("Page401", () => {
  test("renders Page401 component", () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page401 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    screen.getByText("401 Authorization Error")
    expect(screen.getByText("401 Authorization Error")).toBeInTheDocument()
    screen.getByText("Main Page")
    expect(screen.getByText("Main Page")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent("Main Page")
    expect(screen.getByRole("link")).toHaveAttribute("href", "/")
  })

  test("redirects to Main Page after 10s", () => {
    jest.useFakeTimers()

    const component = renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <MemoryRouter initialEntries={[{ pathname: "/error401" }]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </StyledEngineProvider>,
      {
        preloadedState: {
          user: {
            id: "001",
            name: "Test User",
            projects: [
              { projectId: "PROJECT1", projectNumber: "Project 1" },
              { projectId: "PROJECT2", projectNumber: "Project 2" },
            ],
          },
        },
      }
    )

    expect(component.getByText("401 Authorization Error")).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    component.getByText("Login")
    expect(component.getByText("Login")).toBeInTheDocument()
    jest.useRealTimers()
  })
})
