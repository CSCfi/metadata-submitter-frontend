import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { MemoryRouter } from "react-router-dom"

import CSCtheme from "../theme"

import App from "App"
import { renderWithProviders } from "utils/test-utils"
import Page403 from "views/ErrorPages/Page403"

describe("Page403", () => {
  test("renders Page403 component", () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page403 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    screen.getByText("403 Forbidden Error")
    expect(screen.getByText("403 Forbidden Error")).toBeInTheDocument()
    screen.getByText("Home Page")
    expect(screen.getByText("Home Page")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent("Home Page")
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home")
  })

  test("redirects to Home Page after 10s", () => {
    jest.useFakeTimers()

    act(() => {
      renderWithProviders(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <MemoryRouter initialEntries={[{ pathname: "/error403" }]}>
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
    })
    expect(screen.getByText("403 Forbidden Error")).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(10000)
    })
    expect(screen.getByText("My submissions")).toBeInTheDocument()
    jest.useRealTimers()
  })
})
