import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import CSCtheme from "../theme"

import App from "App"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("NewDraftWizard", () => {
  it("should navigate to 404 page on undefined step", () => {
    const store = mockStore({})
    render(
      <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "?step=undefined" }]}>
        <Provider store={store}>
          <ThemeProvider theme={CSCtheme}>
            <App />
          </ThemeProvider>
        </Provider>
      </MemoryRouter>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })
})
