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
    const expectedLinks = ["Open submissions", "Submissions", "New submission"]
    expect(nav.children).toHaveLength(expectedLinks.length)
    expectedLinks.forEach(link => {
      const linkElement = component.getByText(link)
      expect(linkElement).toBeDefined()
    })
  })
})
