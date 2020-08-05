//@flow
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import "style.css"

import store from "store"
import App from "App"

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
