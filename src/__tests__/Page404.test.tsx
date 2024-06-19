import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { MemoryRouter as Router } from "react-router-dom"

import CSCtheme from "../theme"
import "../i18n"

import { renderWithProviders } from "utils/test-utils"
import Page404 from "views/ErrorPages/Page404"

describe("Page404", () => {
  test("renders Page404", () => {
    renderWithProviders(
      <Router initialEntries={["/example-route"]}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <Page404 />
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>
    )
    expect(screen.getByText("404 – Page Not Found")).toBeInTheDocument()
  })
})
