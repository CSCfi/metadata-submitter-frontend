import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"

import CSCtheme from "../theme"

import Page400 from "views/ErrorPages/Page400"

describe("Page400", () => {
  test("renders Page400 component", () => {
    render(
      <ThemeProvider theme={CSCtheme}>
        <Page400 />
      </ThemeProvider>
    )
    screen.getByText("400 Bad Request")
    expect(screen.getByText("400 Bad Request")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent(/our github repo/i)
  })
})
