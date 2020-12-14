import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import CSCtheme from "../theme"

import App from "App"
import Page403 from "views/ErrorPages/Page403"

describe("Page403", () => {
  test("renders Page403 component", () => {
    render(<Page403 />)
    screen.getByText("403 Forbidden Error")
    expect(screen.getByText("403 Forbidden Error")).toBeInTheDocument()
    screen.getByText("Home Page")
    expect(screen.getByText("Home Page")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent("Home Page")
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home")
  })

  test("redirects to Home Page after 10s", () => {
    jest.useFakeTimers()
    let component = render(
      <ThemeProvider theme={CSCtheme}>
        <MemoryRouter initialEntries={[{ pathname: "/error403" }]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    )

    expect(component.getByText("403 Forbidden Error")).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    component.getByText("Your Draft Submissions")
    expect(component.getByText("Your Draft Submissions")).toBeInTheDocument()
    jest.useRealTimers()
  })
})
