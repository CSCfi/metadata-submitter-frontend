//@flow
import React from "react"

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import "style.css"

import App from "App"
import store from "store"

/**
 * Set up custom theme that follows CSC's design guidelines.
 */
const CSCtheme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        textTransform: "none",
        fontWeight: "bold",
        paddingLeft: "32px",
        paddingRight: "32px",
      },
    },
    MuiTypography: {
      subtitle1: {
        fontWeight: 600,
      },
    },
  },
  palette: {
    primary: {
      main: "#8b1a4f",
    },
    secondary: {
      main: "#dfe1e3",
    },
    third: {
      main: "#006476",
    },
    background: {
      default: "white",
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
      size: "small",
    },
    MuiFormControl: {
      variant: "outlined",
      size: "small",
    },
  },
})

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
