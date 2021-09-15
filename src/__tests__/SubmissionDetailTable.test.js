import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import App from "App"

const mockStore = configureStore([])
const store = mockStore({})

const server = setupServer()

const metadataObjects = [
  {
    accessionId: "123testid",
    schema: "study",
    tags: { submissionType: "Form", displayTitle: "Published object" },
  },
]

const draftObjects = [
  {
    accessionId: "456testid",
    schema: "draft-study",
    tags: { displayTitle: "Draft object" },
  },
]

describe("Published folders list", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test("renders draft folder with details", async () => {
    server.use(
      rest.get("/folders/:folderId", (req, res, ctx) => {
        const { folderId } = req.params
        return res(
          ctx.json({
            name: "Test unpublished folder",
            description: "Test description",
            published: false,
            metadataObjects: metadataObjects,
            drafts: draftObjects,
            folderId: folderId,
          })
        )
      }),
      rest.get("/objects/study/:accessionId", (req, res, ctx) => {
        const { accessionId } = req.params
        return res(
          ctx.json({
            descriptor: { studyTitle: "Published object", studyType: "Metagenomics" },
            accessionId: accessionId,
            dateCreated: "2021-08-11T12:10:23.748000",
            dateModified: "2021-08-11T12:10:23.748000",
            publishDate: "2021-10-11T12:10:23.748000",
          })
        )
      }),
      rest.get("/drafts/study/:accessionId", (req, res, ctx) => {
        const { accessionId } = req.params
        return res(
          ctx.json({
            descriptor: { studyTitle: "Draft object", studyType: "Resequencing" },
            accessionId: accessionId,
            dateCreated: "2021-08-11T12:10:18.040000",
            dateModified: "2021-08-11T12:10:18.040000",
          })
        )
      })
    )

    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <MemoryRouter initialEntries={[{ pathname: "/home/drafts/123456" }]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )

    await screen.findByTestId("breadcrumb")

    const editButton = await screen.findByTestId("edit-button")
    expect(editButton).toBeInTheDocument()

    const publishedObject = await screen.findByTestId(metadataObjects[0].tags.displayTitle)
    expect(publishedObject).toBeInTheDocument()

    const draftObject = await screen.findByTestId(draftObjects[0].tags.displayTitle)
    expect(draftObject).toBeInTheDocument()
  })

  test("renders published folder with details", async () => {
    server.use(
      rest.get("/folders/:folderId", (req, res, ctx) => {
        const { folderId } = req.params
        return res(
          ctx.json({
            name: "Test published folder",
            description: "Test description",
            published: true,
            metadataObjects: metadataObjects,
            folderId: folderId,
          })
        )
      }),
      rest.get("/objects/study/:accessionId", (req, res, ctx) => {
        const { accessionId } = req.params
        return res(
          ctx.json({
            descriptor: { studyTitle: "Published object", studyType: "Metagenomics" },
            accessionId: accessionId,
            dateCreated: "2021-08-11T12:10:23.748000",
            dateModified: "2021-08-11T12:10:23.748000",
            publishDate: "2021-10-11T12:10:23.748000",
          })
        )
      })
    )

    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <MemoryRouter initialEntries={[{ pathname: "/home/drafts/123456" }]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )

    await screen.findByTestId("breadcrumb")

    const editButton = await screen.queryByTestId("edit-button")
    expect(editButton).toBeNull()

    const publishedObject = await screen.findByTestId("Published object")
    expect(publishedObject).toBeInTheDocument()
  })

  test("renders 'Add object to folder' button if no draft or submitted objects", async () => {
    server.use(
      rest.get("/folders/:folderId", (req, res, ctx) => {
        const { folderId } = req.params
        return res(
          ctx.json({
            name: "Test published folder",
            description: "Test description",
            published: false,
            metadataObjects: [],
            drafts: [],
            folderId: folderId,
          })
        )
      })
    )

    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <MemoryRouter initialEntries={[{ pathname: "/home/drafts/123456" }]}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )

    await screen.findByTestId("breadcrumb")
    const addObjectsButton = await screen.findByTestId("add-objects-button")
    expect(addObjectsButton).toBeInTheDocument()
  })
})
