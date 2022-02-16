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
    user: { name: "Test User" },
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

  test("", () => undefined)
})
