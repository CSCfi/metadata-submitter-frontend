import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import Nav from "./Nav"

describe("NavBar", () => {
  let component

  beforeEach(() => {
    component = render(
      <MemoryRouter initialEntries={["/home"]}>
        <Nav />
      </MemoryRouter>
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
