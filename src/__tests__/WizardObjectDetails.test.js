import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import SelectedFolderDetails from "components/Home/SelectedFolderDetails"
import WizardObjectDetails from "components/NewDraftWizard/WizardComponents/WizardObjectDetails"

const mockStore = configureStore([])
const store = mockStore({})

const server = setupServer()

const schema = {
  title: "Test schema",
  type: "object",
  properties: {
    listItemFields: {
      type: "object",
      title: "List items section title",
      required: ["stringField"],
      properties: {
        stringField: {
          title: "String Field Title",
          type: "string",
        },
        integerField: {
          title: "Integer Field Title",
          type: "integer",
        },
        numberField: {
          title: "Number Field Title",
          type: "number",
        },
        booleanField: {
          title: "Boolean Field Title",
          type: "boolean",
        },
      },
    },
    arrayFields: {
      type: "object",
      title: "Array items section title",
      properties: {
        checkboxArray: {
          // Eg. Dataset > Dataset Type
          type: "array",
          title: "Checkbox array title",
          items: {
            type: "string",
            enum: ["Checkbox item 1", "Checkbox item 2"],
          },
        },
        oneOfArray: {
          // Eg. Study > Study Links
          type: "array",
          title: "OneOf array title",
          items: {
            title: "Item key",
            oneOf: [
              {
                type: "object",
                title: "First oneOf item",
                properties: { key1: { type: "string", title: "First item label" } },
                required: ["key1"],
              },
              {
                type: "object",
                title: "Second oneOf item",
                properties: { key2: { type: "string", title: "Second item label" } },
                required: ["key2"],
              },
            ],
          },
        },
      },
    },
    oneOf: {
      // Eg. Experiment > Design > Properties > Sample descriptor,
      type: "object",
      title: "OneOf title",
      properties: {
        oneOfField: {
          title: "Options",
          oneOf: [
            {
              type: "object",
              title: "First option",
              properties: { firstOption: { type: "string", title: "First oneOf option label" } },
            },
            {
              type: "object",
              title: "Second option",
              properties: { secondOption: { type: "string", title: "Second oneOf option label" } },
            },
          ],
        },
      },
    },
  },
}

describe("Object details", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("should render object details component on 'Show details' button click", async () => {
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
      <MemoryRouter initialEntries={[{ pathname: "/home/published/testaccessionid" }]}>
        <Provider store={store}>
          <ThemeProvider theme={CSCtheme}>
            <SelectedFolderDetails />
          </ThemeProvider>
        </Provider>
      </MemoryRouter>
    )

    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    userEvent.click(screen.getByTestId("toggle-details"))

    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    expect(screen.getByText("Hide details")).toBeInTheDocument()
    expect(screen.getByTestId("section")).toBeInTheDocument()
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
        <WizardObjectDetails objectType="study" objectData={objectData} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))

    // Sections
    // Note: Nested properties have at least 2 sections
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