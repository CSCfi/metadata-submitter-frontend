import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { BrowserRouter as Router } from "react-router-dom"

import App from "../App"
import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"

describe("App", () => {
  test("gets rendered without crashing", () => {
    renderWithProviders(
      <Router>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>
    )
  })
})
