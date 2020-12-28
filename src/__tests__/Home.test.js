import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import App from "App"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("HomePage", () => {
  const store = mockStore({
    user: { name: "Test User" },
  })
  beforeEach(() => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/home"]}>
          <App />
        </MemoryRouter>
      </Provider>
    )
  })

  test("has correct username from redux store", () => {
    screen.getByText("Logged in as: Test User")
    expect(screen.getByText("Logged in as: Test User")).toBeInTheDocument()
  })
})
