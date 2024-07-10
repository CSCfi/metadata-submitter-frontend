import React from "react"

import { screen } from "@testing-library/react"

import { renderWithProviders } from "utils/test-utils"
import Page400 from "views/ErrorPages/Page400"

describe("Page400", () => {
  test("renders Page400 component", () => {
    renderWithProviders(<Page400 />)
    expect(screen.getByText("400 – BAD REQUEST")).toBeInTheDocument()
  })
})
