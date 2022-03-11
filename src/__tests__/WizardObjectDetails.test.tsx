import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import CustomSchema from "./fixtures/custom_schema.json"

import SelectedFolderDetails from "components/Home/SelectedFolderDetails"
import WizardObjectDetails from "components/SubmissionWizard/WizardComponents/WizardObjectDetails"

const mockStore = configureStore([])
const store = mockStore({
  openedRows: [0],
})

const server = setupServer()

const schema = CustomSchema

describe("Object details", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("should render object details when row has been opened", async () => {
    server.use(
      rest.get("/schemas/:schema", (req, res, ctx) => {
        return res(ctx.json(schema))
      }),
      rest.get("/folders/:folderId", (req, res, ctx) => {
        return res(
          ctx.json({
            name: "Test Folder",
            description: "Folder description",
            published: true,
            metadataObjects: [
              {
                accessionId: "objectAccessionId",
                schema: "study",
                tags: { submissionType: "Form", displayTitle: "Published object" },
              },
            ],
            drafts: [],
            folderId: "testaccessionid",
            dateCreated: 1111111111,
          })
        )
      }),
      rest.get("/objects/study/:accessionId", (req, res, ctx) => {
        return res(
          ctx.json({
            descriptor: { studyTitle: "Published object", studyType: "Synthetic Genomics" },
            accessionId: "edd227d34a4f4340a206ef48c87848da",
            dateCreated: "2021-09-09T05:16:36.002000",
            dateModified: "2021-09-09T05:16:36.002000",
            publishDate: "2021-11-09T05:16:36.002000",
          })
        )
      })
    )

    render(
      <MemoryRouter initialEntries={[{ pathname: "/en/home/published/testaccessionid" }]}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <SelectedFolderDetails />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </MemoryRouter>
    )

    const toggleDetailsButton = await screen.findByTestId("toggle-details")
    expect(toggleDetailsButton).toBeInTheDocument()

    const section = await screen.findByTestId("section")
    expect(section).toBeInTheDocument()
  })

  it("should render object details by object data and schema", async () => {
    server.use(
      rest.get("/schemas/:schema", (req, res, ctx) => {
        return res(ctx.json(schema))
      })
    )

    const objectData = {
      listItemFields: {
        stringField: "String label",
        integerField: "Integer label",
        numberField: "Number label",
        booleanField: "Boolean label",
      },
      arrayFields: { checkboxArray: ["Checkbox item 1", "Checkbox item 2"], oneOfArray: [{ key2: "Test item" }] },
      oneOf: { oneOfField: { firstOption: "Test label" } },
    }

    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardObjectDetails objectType="study" objectData={objectData} />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )

    // Sections
    // Note: Nested properties have at least 2 sections
    await screen.findAllByTestId("section")

    expect(screen.getAllByTestId("section")).toHaveLength(6)

    // List items
    for (const item of Object.keys(objectData.listItemFields)) {
      expect(screen.getByTestId(`listItemFields.${item}`)).toBeInTheDocument()
    }

    // Array items
    expect(screen.getAllByTestId("checkbox-item")).toHaveLength(2)
    expect(screen.queryByText("First oneOf item")).not.toBeInTheDocument()
    expect(screen.getByTestId("arrayFields.oneOfArray[0].key2")).toBeInTheDocument()

    // OneOf
    expect(screen.getByTestId("oneOf.oneOfField.firstOption")).toBeInTheDocument()
    expect(screen.queryByText("Second oneOf option label")).not.toBeInTheDocument()
  })
})
