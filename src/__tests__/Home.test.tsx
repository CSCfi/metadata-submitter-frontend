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
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe("HomePage", () => {
  const store = mockStore({
    user: {
      name: "Test User",
      projects: [
        { projectId: "PROJECT1", projectName: "Project 1" },
        { projectId: "PROJECT2", projectName: "Project 2" },
      ],
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

  test("should render its content correctly", () => {
    expect(screen.getByText("My submissions")).toBeInTheDocument()

    expect(screen.getByRole("tab", { name: "Drafts" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Published" })).toBeInTheDocument()

    expect(screen.getByTestId("link-create-submission")).toBeInTheDocument()
  })
})
