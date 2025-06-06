import { StyledEngineProvider } from "@mui/material/styles"
import { ThemeProvider } from "@mui/system"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import "style.css"
import { BrowserRouter as Router } from "react-router"

import CSCtheme from "./theme"

import App from "App"
import { setupStore } from "store"

import "./i18n"

/**
 * Render app with redux store and custom theme.
 */
const store = setupStore()
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

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(MyApp)
/**
 * Reload app with after redux store has been reloaded, see: https://redux-toolkit.js.org/tutorials/advanced-tutorial#store-setup-and-hmr
 */
if (import.meta.env.NODE_ENV === "development" && import.meta.hot) {
  import.meta.hot.accept("./App", () => root)
}
