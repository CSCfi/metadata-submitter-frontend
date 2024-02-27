import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import App from "App"
import Page401 from "views/ErrorPages/Page401"

const mockStore = configureStore()

describe("Page401", () => {
  test("renders Page401 component", () => {
    render(
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
    const store = mockStore({
      user: { name: "test" },
    })
    const component = render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <MemoryRouter initialEntries={[{ pathname: "/error401" }]}>
              <App />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
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
