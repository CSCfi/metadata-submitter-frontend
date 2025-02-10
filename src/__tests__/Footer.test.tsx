import React from "react"

import { screen } from "@testing-library/react"
import { MemoryRouter } from "react-router" // Import MemoryRouter

import Footer from "../components/Footer"

import { renderWithProviders } from "utils/test-utils"

describe("Footer", () => {
  beforeEach(() => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/"]}>
        <Footer />
      </MemoryRouter>
    )
  })

  test("should render its content correctly", () => {
    const footerNames = screen.getAllByTestId("footer-name")
    const footerLinks = screen.getAllByTestId("footer-link")

    expect(footerNames.length).toBe(2)
    expect(footerNames[0]).toHaveTextContent("SD Submit")
    expect(footerNames[1]).toHaveTextContent("CSC - IT Center for Science Ltd.")

    expect(footerLinks.length).toBe(5)
    expect(footerLinks[0]).toHaveTextContent("CSC - IT Center for Science Ltd.")
    expect(footerLinks[1]).toHaveTextContent("Service description")
    expect(footerLinks[2]).toHaveTextContent("Accessibility")
    expect(footerLinks[3]).toHaveTextContent("Privacy")
    expect(footerLinks[4]).toHaveTextContent("About Sensitive Data services")
  })
})
