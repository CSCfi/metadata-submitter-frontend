import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { createMemoryHistory } from "history"
import { Router } from "react-router-dom"

import Page404 from "views/ErrorPages/Page404"

describe("Page404", () => {
  test("renders Page404", () => {
    const history = createMemoryHistory()
    const route = "/example-route"
    history.push(route)
    render(
      <Router history={history}>
        <Page404 />
      </Router>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
    expect(screen.getByTestId("location-pathname")).toHaveTextContent(route)
  })
})
