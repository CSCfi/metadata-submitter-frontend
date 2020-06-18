import React from "react"
import "@testing-library/jest-dom/extend-expect"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import App from "./App"
const mockStore = configureStore([])

describe("App", () => {
  test("gets rendered without crashing", () => {
    const store = mockStore({
      objectType: "",
    })
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  })
})
