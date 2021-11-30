import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { render, screen, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import CSCtheme from "../theme"

import App from "App"
import Page403 from "views/ErrorPages/Page403"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("Page403", () => {
  test("renders Page403 component", () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <Page403 />
        </ThemeProvider>
      </StyledEngineProvider>
    )
    screen.getByText("403 Forbidden Error")
    expect(screen.getByText("403 Forbidden Error")).toBeInTheDocument()
    screen.getByText("Home Page")
    expect(screen.getByText("Home Page")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent("Home Page")
    expect(screen.getByRole("link")).toHaveAttribute("href", "/home")
  })

  test("redirects to Home Page after 10s", () => {
    jest.useFakeTimers()
    const store = mockStore({
      user: { name: "test" },
      selectedFolder: {
        folderId: "Test folderId",
        name: "Test name",
        description: "Test description",
        drafts: [],
        metadataObjects: [],
        allObjects: [],
      },
    })
    let component = render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <MemoryRouter initialEntries={[{ pathname: "/error403" }]}>
              <App />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )

    expect(component.getByText("403 Forbidden Error")).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    jest.useRealTimers()
  })
})
