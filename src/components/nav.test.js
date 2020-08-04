import React from "react"
import "@testing-library/jest-dom/extend-expect"
import { render } from "@testing-library/react"
import Nav from "./nav"
import { BrowserRouter as Router } from "react-router-dom"

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
    const expectedLinks = [
      "Open submissions",
      "Submissions",
      "Create new draft",
    ]
    expect(nav.children).toHaveLength(expectedLinksLength)
    expectedLinks.forEach(link => {
      const linkElement = component.getByText(link)
      expect(linkElement).toBeDefined()
    })
  })
})
