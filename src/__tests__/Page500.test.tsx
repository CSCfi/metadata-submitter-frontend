import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"

import CSCtheme from "../theme"
import "../i18n"

import { renderWithProviders } from "utils/test-utils"
import Page500 from "views/ErrorPages/Page500"

describe("Page500", () => {
  test("renders Page500 component", () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page500 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    expect(screen.getByText("500 – SERVICE UNAVAILABLE")).toBeInTheDocument()
  })
})
