import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
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
      unpublishedFolders: [
        { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub", published: false },
        { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub", published: false },
      ],
      publishedFolders: [
        { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub", published: false },
        { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub", published: false },
      ],
      totalFolders: {
        totalUnpublishedFolders: [
          { descriptioni: "d", drafts: [], folderId: "UNPUB1", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB2", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB3", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB4", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB5", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB6", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB7", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB8", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB9", metadataObjects: [], name: "Unpub", published: false },
          { descriptioni: "d", drafts: [], folderId: "UNPUB10", metadataObjects: [], name: "Unpub", published: false },
        ],
        totalPublishedFolders: [
          { descriptioni: "d", drafts: [], folderId: "PUB1", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB2", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB3", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB4", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB5", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB6", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB7", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB8", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB9", metadataObjects: [], name: "Pub", published: false },
          { descriptioni: "d", drafts: [], folderId: "PUB10", metadataObjects: [], name: "Pub", published: false },
        ],
      },
    })
    const component = render(
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
