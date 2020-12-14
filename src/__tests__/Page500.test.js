import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"

import Page500 from "views/ErrorPages/Page500"

describe("Page500", () => {
  test("renders Page500 component", () => {
    render(<Page500 />)
    screen.getByText("500 Internal Server Error")
    expect(screen.getByText("500 Internal Server Error")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent(/our github repo/i)
  })
})
