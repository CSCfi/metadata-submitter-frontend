import React from "react"

import { screen } from "@testing-library/react"

import { renderWithProviders } from "utils/test-utils"
import Page500 from "views/ErrorPages/Page500"

describe("Page500", () => {
  test("renders Page500 component", () => {
    renderWithProviders(<Page500 />)
    expect(screen.getByText("500 – SERVICE UNAVAILABLE")).toBeInTheDocument()
  })
})
