import React from "react"
import { render } from "@testing-library/react"
import App from "./App"

test.each([
  "Study",
  "Project",
  "Sample",
  "Experiment",
  "Run",
  "Analysis",
  "Dac",
  "Policy",
  "Dataset",
])("All categories are rendered to frontpage", type => {
  const { getByText } = render(<App />)
  const typeElement = getByText(`${type}`)
  expect(typeElement).toBeInTheDocument()
})
