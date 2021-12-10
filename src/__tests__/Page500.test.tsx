import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"

import CSCtheme from "../theme"

import Page500 from "views/ErrorPages/Page500"

describe("Page500", () => {
  test("renders Page500 component", () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page500 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    screen.getByText("500 Internal Server Error")
    expect(screen.getByText("500 Internal Server Error")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent(/our github repo/i)
  })
})