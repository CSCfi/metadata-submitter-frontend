import React from "react"

import { StyledEngineProvider } from "@mui/material/styles"
import { ThemeProvider } from "@mui/system"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import "style.css"
import { BrowserRouter as Router } from "react-router-dom"

import CSCtheme from "./theme"

import App from "App"
import store from "store"

import "./i18n"

/**
 * Render app with redux store and custom theme.
 */
const MyApp = (
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

const root = createRoot(document.getElementById("root"))
root.render(MyApp)
/**
 * Reload app with after redux store has been reloaded, see: https://redux-toolkit.js.org/tutorials/advanced-tutorial#store-setup-and-hmr
 */
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./App", root)
}
