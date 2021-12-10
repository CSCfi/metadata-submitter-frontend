import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { MemoryRouter as Router } from "react-router-dom"

import CSCtheme from "../theme"

import Page404 from "views/ErrorPages/Page404"

describe("Page404", () => {
  test("renders Page404", () => {
    render(
      <Router initialEntries={["/example-route"]}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <Page404 />
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
    expect(screen.getByTestId("location-pathname")).toHaveTextContent("/example-route")
  })
})