import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, RenderResult } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import Nav from "../components/Nav"
import CSCtheme from "../theme"

const mockStore = configureStore()

describe("NavBar", () => {
  let component: RenderResult<typeof import("@testing-library/dom/types/queries"), HTMLElement>
  const store = mockStore({
    user: { name: "test" },
  })
  beforeEach(() => {
    component = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/en/home"]}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <Nav />
            </ThemeProvider>
          </StyledEngineProvider>
        </MemoryRouter>
      </Provider>
    )
  })

  test("has correct nav links rendered", () => {
    const nav = component.container.querySelector("nav") as HTMLElement
    const expectedLinksLength = 6
    const expectedLinks = ["Open submissions", "Submissions", "Create Submission", "Log out"]
    expect(nav.children).toHaveLength(expectedLinksLength)
    expectedLinks.forEach(link => {
      const linkElement = component.getByText(link)
      expect(linkElement).toBeDefined()
    })
  })
})