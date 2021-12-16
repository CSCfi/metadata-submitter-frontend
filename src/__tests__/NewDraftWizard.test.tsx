import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import CSCtheme from "../theme"

import App from "App"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const server = setupServer()

describe("NewDraftWizard", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("should navigate to 404 page on undefined step", () => {
    const store = mockStore({})
    render(
      <MemoryRouter initialEntries={[{ pathname: "/newdraft", search: "?step=undefined" }]}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </MemoryRouter>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })

  it("should redirect back to draft wizard start on invalid folderId", async () => {
    server.use(
      rest.get("/folders/:folderId", (req, res, ctx) => {
        const { folderId } = req.params
        return res(
          ctx.status(404),
          ctx.json({
            type: "about:blank",
            title: "Not Found",
            detail: `Folder with id ${folderId} was not found.`,
            instance: `/folders/${folderId}`,
          })
        )
      })
    )

    const store = mockStore({
      objectType: "",
      submissionType: "",
      submissionFolder: { metaDataObjects: [] },
      objectTypesArray: ["study"],
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/en/newdraft/123456", search: "?step=1" }]}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </MemoryRouter>
    )

    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    expect(screen.getByTestId("folderName")).toBeInTheDocument()
  })

  it("should render folder by folderId in URL parameters", async () => {
    const folderId = "123456"
    const folderName = "Folder name"
    const folderDescription = "Folder description"

    server.use(
      rest.get("/folders/:folderId", (req, res, ctx) => {
        const { folderId } = req.params
        return res(
          ctx.json({
            name: folderName,
            description: folderDescription,
            folderId: folderId,
          })
        )
      })
    )

    const store = mockStore({
      objectType: "",
      submissionType: "",
      submissionFolder: {
        name: folderName,
        folderDescription: folderDescription,
        published: false,
        metadataObjects: [],
        drafts: [],
        folderId: folderId,
      },
      objectTypesArray: ["study"],
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: `/en/newdraft/${folderId}`, search: "?step=0" }]}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </MemoryRouter>
    )

    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    const folderNameInput = screen.getByTestId("folderName")
    expect(folderNameInput).toHaveValue(folderName)
  })
})
