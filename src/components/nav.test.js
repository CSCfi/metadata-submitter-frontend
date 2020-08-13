import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"

import Nav from "./nav"

describe("NavBar", () => {
  let component

  beforeEach(() => {
    component = render(
      <Router>
        <Nav />
      </Router>
    )
  })

  test("has correct nav links rendered", () => {
    const nav = component.container.querySelector("nav")
    const expectedLinksLength = 4
    const expectedLinks = ["Open submissions", "Submissions", "Create Submission"]
    expect(nav.children).toHaveLength(expectedLinksLength)
    expectedLinks.forEach(link => {
      const linkElement = component.getByText(link)
      expect(linkElement).toBeDefined()
    })
  })
})
