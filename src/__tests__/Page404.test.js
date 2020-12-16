import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"
import { createMemoryHistory } from "history"
import { Router } from "react-router-dom"

import CSCtheme from "../theme"

import Page404 from "views/ErrorPages/Page404"

describe("Page404", () => {
  test("renders Page404", () => {
    const history = createMemoryHistory()
    const route = "/example-route"
    history.push(route)
    render(
      <Router history={history}>
        <ThemeProvider theme={CSCtheme}>
          <Page404 />
        </ThemeProvider>
      </Router>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
    expect(screen.getByTestId("location-pathname")).toHaveTextContent(route)
  })
})
