import { screen, waitForElementToBeRemoved } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Routes, Route } from "react-router"

import { renderWithProviders } from "utils/test-utils"
import SubmissionWizard from "views/Submission"

const allWorkflows = { FEGA: "", Bigpicture: "", SDSX: "" }
const submissionName = "Submission name"
const submissionDescription = "Submission description"

const restHandlers = [
  http.get("/v1/users", () => {
    return HttpResponse.json({
      userId: "001",
      name: "Test User",
      projects: [{ projectId: "PROJECT1" }, { projectId: "PROJECT2" }],
    })
  }),
  http.get("/v1/submissions/:submissionId", ({ params }) => {
    const id = params.submissionId

    return id === "123456"
      ? HttpResponse.json({
          name: submissionName,
          description: submissionDescription,
          submissionId: id,
          workflow: "FEGA",
          drafts: [],
          metadataObjects: [],
        })
      : new HttpResponse("Not found", { status: 404 })
  }),
]

const server = setupServer(...restHandlers)

describe("SubmissionWizard", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  sessionStorage.setItem(`cached_workflows`, JSON.stringify(allWorkflows))

  // Test the case when "step" is undefined to return 404
  test("should navigate to 404 page on undefined step", () => {
    renderWithProviders(
      <MemoryRouter
        initialEntries={[{ pathname: "/submission/123456", search: "?step=undefined" }]}
      >
        <Routes>
          <Route path="/submission/:submissionId" element={<SubmissionWizard />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          stepObject: {
            step: 1,
            stepObjectType: "submissionDetails",
          },
        },
      }
    )
    expect(screen.getByText("404 – PAGE NOT FOUND")).toBeInTheDocument()
  })

  test("should redirect to 404 page on invalid submissionId", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: `/submission/123`, search: "?step=1" }]}>
        <Routes>
          <Route path="/submission/:submissionId" element={<SubmissionWizard />} />
        </Routes>
      </MemoryRouter>
    )
    await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
    expect(screen.getByText("404 – PAGE NOT FOUND")).toBeInTheDocument()
  })

  test("should render submission by submissionId in URL parameters", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: `/submission/123456`, search: "?step=1" }]}>
        <Routes>
          <Route path="/submission/:submissionId" element={<SubmissionWizard />} />
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
