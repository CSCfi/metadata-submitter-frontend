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
import { ObjectTypes } from "constants/wizardObject"
import SubmissionWizard from "views/Submission"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const server = setupServer()

describe("SubmissionWizard", () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const initialStore = {
    submissionType: "",
    objectTypesArray: Object.keys(ObjectTypes),
    submission: {
      drafts: [],
      metadataObjects: [],
    },
  }

  test("should navigate to 404 page on undefined step", () => {
    const store = mockStore({
      ...initialStore,
      stepObject: { step: 1, stepObjectType: "submissionDetails" },
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "?step=undefined" }]}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <SubmissionWizard />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </MemoryRouter>
    )
    screen.getByText("404 Not Found")
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })

  test("should redirect back to draft wizard start on invalid submissionId", async () => {
    server.use(
      rest.get("/v1/submissions/:submissionId", (req, res, ctx) => {
        const { submissionId } = req.params
        return res(
          ctx.status(404),
          ctx.json({
            type: "about:blank",
            title: "Not Found",
            detail: `Submission with id ${submissionId} was not found.`,
            instance: `/v1/submissions/${submissionId}`,
          })
        )
      })
    )

    server.use(
      rest.get("/v1/users/current", (req, res, ctx) => {
        return res(
          ctx.json({
            userId: "abc",
            name: "Test user",
            templates: [],
            submissions: [],
          })
        )
      })
    )
    const store = mockStore({
      ...initialStore,
      user: { name: "test" },
      stepObject: { step: 2, stepObjectType: "study" },
    })
    render(
      <MemoryRouter initialEntries={[{ pathname: "/en/submission/123456", search: "?step=1" }]}>
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
    expect(screen.getByTestId("submissionName")).toBeInTheDocument()
  })

  /*
   * The test is commented out to be used again later
   */

  // it("should render submission by submissionId in URL parameters", async () => {
  //   const submissionId = "123456"
  //   const submissionName = "Submission name"
  //   const submissionDescription = "Submission description"

  //   server.use(
  //     rest.get("/v1/submissions/:submissionId", (req, res, ctx) => {
  //       const { submissionId } = req.params
  //       return res(
  //         ctx.json({
  //           name: submissionName,
  //           description: submissionDescription,
  //           submissionId: submissionId,
  //         })
  //       )
  //     })
  //   )

  //   const store = mockStore({
  //     objectType: "",
  //     submissionType: "",
  //     submission: {
  //       name: submissionName,
  //       submissionDescription: submissionDescription,
  //       published: false,
  //       metadataObjects: [],
  //       drafts: [],
  //       submissionId: submissionId,
  //     },
  //     objectTypesArray: ["study"],
  //   })
  //   render(
  //     <MemoryRouter initialEntries={[{ pathname: `/en/submission/${submissionId}`, search: "?step=0" }]}>
  //       <Provider store={store}>
  //         <StyledEngineProvider injectFirst>
  //           <ThemeProvider theme={CSCtheme}>
  //             <App />
  //           </ThemeProvider>
  //         </StyledEngineProvider>
  //       </Provider>
  //     </MemoryRouter>
  //   )

  //   await waitForElementToBeRemoved(() => screen.getByRole("progressbar"))
  //   const submissionNameInput = screen.getByTestId("submissionName")
  //   expect(submissionNameInput).toHaveValue(submissionName)
  // })
})
