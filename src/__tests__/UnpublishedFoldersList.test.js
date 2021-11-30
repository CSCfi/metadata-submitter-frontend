import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import CSCtheme from "../theme"

import App from "App"
import { ObjectTypes } from "constants/wizardObject"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("Unpublished folders list", () => {
  const store = mockStore({
    user: { name: "Test User" },
    totalFolders: { totalUnpublishedFolders: 66, totalPublishedFolders: 65 },
    unpublishedFolders: [
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
    publishedFolders: [],
    selectedFolder: {
      folderId: "Test folderId",
      name: "Test name",
      description: "Test description",
      drafts: [
        {
          accessionId: "TESTID1",
          schema: `draft-${ObjectTypes.study}`,
        },
        {
          accessionId: "TESTID2",
          schema: `draft-${ObjectTypes.study}`,
        },
      ],
      metadataObjects: [
        {
          accessionId: "TESTID1",
          schema: ObjectTypes.study,
        },
        {
          accessionId: "TESTID2",
          schema: ObjectTypes.study,
        },
      ],
      allObjects: [],
    },
  })

  test("renders unpublished folders correctly with pagination", () => {
    const { getAllByText, getByTestId, getByLabelText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/en/home/drafts"]}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </MemoryRouter>
      </Provider>
    )
    const itemList = getAllByText("Unpub")
    expect(itemList).toHaveLength(10)

    const pagination = getByTestId("table-pagination")
    expect(pagination).toBeVisible()

    const itemsPerPageText = getAllByText("Items per page:")
    expect(itemsPerPageText).toHaveLength(1)

    const itemsPerPageValue = within(pagination).getByRole("textbox", { hidden: true })
    expect(itemsPerPageValue).toBeInTheDocument()
    expect(itemsPerPageValue).toHaveDisplayValue(10)

    const previousPageButton = getByLabelText("previous page")
    expect(previousPageButton).toBeVisible()

    const nextPageButton = getByLabelText("next page")
    expect(nextPageButton).toBeVisible()
  })
})
