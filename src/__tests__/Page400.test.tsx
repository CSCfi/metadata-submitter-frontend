import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"

import CSCtheme from "../theme"
import "../i18n"

import { renderWithProviders } from "utils/test-utils"
import Page400 from "views/ErrorPages/Page400"

describe("Page400", () => {
  test("renders Page400 component", () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page400 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    expect(screen.getByText("400 – BAD REQUEST")).toBeInTheDocument()
  })
})
