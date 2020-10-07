//@flow
import React from "react"

import { ThemeProvider } from "@material-ui/core/styles"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import "style.css"

import CSCtheme from "./theme"

import App from "App"
import store from "store"

/**
 * Render app with redux store and custom theme.
 */
const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider theme={CSCtheme}>
        <App />
      </ThemeProvider>
    </Provider>,
    document.getElementById("root")
  )
}
render()

/**
 * Reload app with after redux store has been reloaded, see: https://redux-toolkit.js.org/tutorials/advanced-tutorial#store-setup-and-hmr
 */
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./App", render)
}
