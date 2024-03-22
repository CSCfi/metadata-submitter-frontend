import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter } from "react-router-dom"

import CSCtheme from "../theme"

import CustomSchema from "./fixtures/custom_schema.json"

import SelectedSubmissionDetails from "components/Home/SelectedSubmissionDetails"
import WizardObjectDetails from "components/SubmissionWizard/WizardComponents/WizardObjectDetails"
import { renderWithProviders } from "utils/test-utils"

const schema = CustomSchema

const restHandlers = [
  http.get("/v1/schemas/:schema", () => {
    return HttpResponse.json(schema)
  }),
  http.get("/v1/submissions/:submissionId", () => {
    return HttpResponse.json({
      name: "Test Submission",
      description: "Submission description",
      published: true,
      metadataObjects: [
        {
          accessionId: "objectAccessionId",
          schema: "study",
          tags: { submissionType: "Form", displayTitle: "Published object" },
        },
      ],
      drafts: [],
      submissionId: "testaccessionid",
      dateCreated: 1111111111,
    })
  }),
  http.get("/v1/objects/study/:accessionId", () => {
    return HttpResponse.json({
      descriptor: { studyTitle: "Published object", studyType: "Synthetic Genomics" },
      accessionId: "edd227d34a4f4340a206ef48c87848da",
      dateCreated: "2021-09-09T05:16:36.002000",
      dateModified: "2021-09-09T05:16:36.002000",
      publishDate: "2021-11-09T05:16:36.002000",
    })
  }),
]

const server = setupServer(...restHandlers)
describe("Object details", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("should render object details when row has been opened", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/en/home/published/testaccessionid" }]}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <SelectedSubmissionDetails />
          </ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>,
      {
        preloadedState: {
          openedRows: [0],
        },
      }
    )
    const toggleDetailsButton = await screen.findByTestId("toggle-details")
    expect(toggleDetailsButton).toBeInTheDocument()
    const section = await screen.findByTestId("section")
    expect(section).toBeInTheDocument()
  })

  it("should render object details by object data and schema", async () => {
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
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardObjectDetails objectType="study" objectData={objectData} />
        </ThemeProvider>
      </StyledEngineProvider>,
      {
        preloadedState: {
          openedRows: [0],
        },
      }
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
