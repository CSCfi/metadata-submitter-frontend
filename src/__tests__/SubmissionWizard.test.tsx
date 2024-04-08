import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, waitForElementToBeRemoved } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Routes, Route } from "react-router-dom"

import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"
import SubmissionWizard from "views/Submission"

const allWorkflows = { FEGA: "", BigPicture: "", SDSX: "" }
const submissionName = "Submission name"
const submissionDescription = "Submission description"

const restHandlers = [
  http.get("/v1/users/current", () => {
    return HttpResponse.json({
      userId: "001",
      name: "Test User",
      projects: [
        { projectId: "PROJECT1", projectNumber: "Project 1" },
        { projectId: "PROJECT2", projectNumber: "Project 2" },
      ],
    })
  }),
  //http.get("/v1/submissions/:submissionId", ({ params }) => {
  //  const { submissionId } = params
  //  return HttpResponse.json({
  //    type: "about:blank",
  //    title: "Not Found",
  //    detail: `Submission with id ${submissionId} was not found.`,
  //    instance: `/v1/submissions/${submissionId}`,
  //  })
  //}),
  http.get("/v1/submissions/:submissionId", ({ params }) => {
    const id = params.submissionId
    return HttpResponse.json({
      name: submissionName,
      description: submissionDescription,
      submissionId: id,
      workflow: "FEGA",
      drafts: [],
      metadataObjects: [],
    })
  }),
]

const server = setupServer(...restHandlers)

describe("SubmissionWizard", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  sessionStorage.setItem(`cached_workflows`, JSON.stringify(allWorkflows))

  // TODO: Handle the case when "step" is undefined or wrong submissionId to return 404
  // then fix the test case below
  test("should navigate to 404 page on undefined step", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=undefined" }]}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <SubmissionWizard />
          </ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>,
      {
        preloadedState: {
          stepObject: { step: 1, stepObjectType: "submissionDetails" },
        },
      }
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })
  /*
   * The test needs to be reconsider the expected outcome when typing wrong submisisonId
   */
  test("should redirect back to draft wizard start on invalid submissionId", async () => {
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

  it("should render submission by submissionId in URL parameters", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: `/submission/123456`, search: "?step=1" }]}>
        <Routes>
          <Route
            path="/submission/:submissionId"
            element={
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={CSCtheme}>
                  <SubmissionWizard />
                </ThemeProvider>
              </StyledEngineProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    /* waifForElementToBeRemoved is needed to wait for
      the mock promises to all resolve
    */
    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))

    const submissionNameInput = screen.getByTestId("submissionName")
    expect(submissionNameInput).toHaveValue(submissionName)
  })
})
