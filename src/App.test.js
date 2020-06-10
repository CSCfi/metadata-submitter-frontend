import React from "react"
import { render } from "@testing-library/react"
import App from "./App"

test("Renders upload text", () => {
  const { getByText } = render(<App />)
  const linkElement = getByText(/Upload an XML file/i)
  expect(linkElement).toBeInTheDocument()
})
