import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter as Router } from "react-router-dom"
import configureStore from "redux-mock-store"

import App from "../App"
const mockStore = configureStore([])
import CSCtheme from "../theme"

describe("App", () => {
  test("gets rendered without crashing", () => {
    const store = mockStore({
      objectType: "",
    })
    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <Router>
            <App />
          </Router>
        </ThemeProvider>
      </Provider>
    )
  })
})
