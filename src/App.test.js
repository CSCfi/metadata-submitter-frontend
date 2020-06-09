import React from "react"
import { render } from "@testing-library/react"
import App from "./App"

test("renders testing link", () => {
  const { getByText } = render(<App />)
  const linkElement = getByText(/Testing stuff here/i)
  expect(linkElement).toBeInTheDocument()
})
