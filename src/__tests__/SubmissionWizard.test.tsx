//import React from "react"

import "@testing-library/jest-dom"
//import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
//import { screen, waitForElementToBeRemoved } from "@testing-library/react"
//import { rest } from "msw"
import { setupServer } from "msw/node"
//import { act } from "react-dom/test-utils"
//import { MemoryRouter } from "react-router-dom"

//import CSCtheme from "../theme"

//import App from "App"
//import { ObjectTypes } from "constants/wizardObject"
//import { renderWithProviders } from "utils/test-utils"
//import SubmissionWizard from "views/Submission"

const server = setupServer()

describe("SubmissionWizard", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  //const initialStore = {
  //  submissionType: "",
  //  objectTypesArray: Object.keys(ObjectTypes),
  //  submission: {
  //    drafts: [],
  //    metadataObjects: [],
  //  },
  //}

  test("should navigate to 404 page on undefined step", () => {
    //renderWithProviders(
    //  <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=undefined" }]}>
    //    <StyledEngineProvider injectFirst>
    //      <ThemeProvider theme={CSCtheme}>
    //        <SubmissionWizard />
    //      </ThemeProvider>
    //    </StyledEngineProvider>
    //  </MemoryRouter>,
    //  {
    //    preloadedState: {
    //      ...initialStore,
    //      stepObject: { step: 1, stepObjectType: "submissionDetails" },
    //    },
    //  }
    //)
    //screen.getByText("404 Not Found")
    //expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })
  /*
   * The test is commented out to be used again later
   */
  test("should redirect back to draft wizard start on invalid submissionId", async () => {
    //act(() => {
    //  server.use(
    //    rest.get("/v1/submissions/:submissionId", (req, res, ctx) => {
    //      const { submissionId } = req.params
    //      return res(
    //        ctx.status(404),
    //        ctx.json({
    //          type: "about:blank",
    //          title: "Not Found",
    //          detail: `Submission with id ${submissionId} was not found.`,
    //          instance: `/v1/submissions/${submissionId}`,
    //        })
    //      )
    //    })
    //  )
    //  server.use(
    //    rest.get("/v1/users/current", (req, res, ctx) => {
    //      return res(
    //        ctx.json({
    //          userId: "abc",
    //          name: "Test user",
    //          templates: [],
    //          submissions: [],
    //        })
    //      )
    //    })
    //  )
    //})
    //act(() => {
    //  renderWithProviders(
    //    <MemoryRouter initialEntries={[{ pathname: "/en/submission/123456", search: "?step=1" }]}>
    //      <StyledEngineProvider injectFirst>
    //        <ThemeProvider theme={CSCtheme}>
    //          <App />
    //        </ThemeProvider>
    //      </StyledEngineProvider>
    //    </MemoryRouter>,
    //    {
    //      preloadedState: {
    //        ...initialStore,
    //        user: { name: "test" },
    //        stepObject: { step: 2, stepObjectType: "study" },
    //      },
    //    }
    //  )
    //})
    //await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    //expect(screen.getByTestId("submissionName")).toBeInTheDocument()
  })

  /*
   * The test is commented out to be used again later
   */

  it("should render submission by submissionId in URL parameters", async () => {
    //const submissionId = "123456"
    //const submissionName = "Submission name"
    //const submissionDescription = "Submission description"
    //server.use(
    //  rest.get(`/v1/submission/:submissionId`, (req, res, ctx) => {
    //    return res(
    //      ctx.json({
    //        name: submissionName,
    //        description: submissionDescription,
    //        submissionId: submissionId,
    //        workflow: "FEGA",
    //      })
    //    )
    //  })
    //)
    //renderWithProviders(
    //  <MemoryRouter initialEntries={[{ pathname: `/v1/submission/${submissionId}`, search: "?step=0" }]}>
    //    <StyledEngineProvider injectFirst>
    //      <ThemeProvider theme={CSCtheme}>
    //        <SubmissionWizard />
    //      </ThemeProvider>
    //    </StyledEngineProvider>
    //  </MemoryRouter>,
    //  {
    //    objectType: "",
    //    submissionType: "",
    //    submission: {
    //      name: submissionName,
    //      submissionDescription: submissionDescription,
    //      published: false,
    //      metadataObjects: [],
    //      drafts: [],
    //      submissionId: submissionId,
    //    },
    //    objectTypesArray: ["study"],
    //  }
    //)
    //await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    //const submissionNameInput = screen.getByTestId("submissionName")
    //expect(submissionNameInput).toHaveValue(submissionName)
  })
})
