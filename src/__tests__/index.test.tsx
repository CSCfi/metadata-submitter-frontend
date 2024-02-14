import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
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
        <Router>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </Router>
      </Provider>
    )
  })
})
