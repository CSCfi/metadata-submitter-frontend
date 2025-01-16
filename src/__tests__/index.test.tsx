import React from "react"

import { BrowserRouter as Router } from "react-router"

import App from "../App"

import { renderWithProviders } from "utils/test-utils"

describe("App", () => {
  test("gets rendered without crashing", () => {
    renderWithProviders(
      <Router>
        <App />
      </Router>
    )
  })
})
