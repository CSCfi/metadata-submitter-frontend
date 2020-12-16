import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"

import CSCtheme from "../theme"

import Page500 from "views/ErrorPages/Page500"

describe("Page500", () => {
  test("renders Page500 component", () => {
    render(
      <ThemeProvider theme={CSCtheme}>
        <Page500 />
      </ThemeProvider>
    )
    screen.getByText("500 Internal Server Error")
    expect(screen.getByText("500 Internal Server Error")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent(/our github repo/i)
  })
})
