import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import CSCtheme from "../theme"

import App from "App"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}))

describe("HomePage", () => {
  const store = mockStore({
    user: { name: "Test User" },
    selectedFolder: {
      folderId: "Test folderId",
      name: "Test name",
      description: "Test description",
      drafts: [],
      metadataObjects: [],
      allObjects: [],
    },
  })
  beforeEach(() => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/en/home"]}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </MemoryRouter>
      </Provider>
    )
  })

  test("has correct username from redux store", () => {
    screen.getByText("Logged in as: Test User")
    expect(screen.getByText("Logged in as: Test User")).toBeInTheDocument()
  })
})
