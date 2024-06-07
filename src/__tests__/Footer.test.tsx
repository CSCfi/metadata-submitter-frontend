import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"

import Footer from "../components/Footer"
import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"

describe("Footer", () => {
  beforeEach(() => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Footer />
        </ThemeProvider>
      </StyledEngineProvider>
    )
  })

  test("should render its content correctly", () => {
    const footerNames = screen.getAllByTestId("footer-name")
    const footerLinks = screen.getAllByTestId("footer-link")

    expect(footerNames.length).toBe(3)
    expect(footerNames[0]).toHaveTextContent("SD Submit")
    expect(footerNames[1]).toHaveTextContent("CSC - IT Center for Science Ltd.")
    expect(footerNames[2]).toHaveTextContent("P.O. Box 405 FI-02101 Espoo, Finland")

    expect(footerLinks.length).toBe(4)
    expect(footerLinks[0]).toHaveTextContent("Service description")
    expect(footerLinks[1]).toHaveTextContent("Accessibility")
    expect(footerLinks[2]).toHaveTextContent("Privacy")
    expect(footerLinks[3]).toHaveTextContent("About Sensitive Data services")
  })
})
