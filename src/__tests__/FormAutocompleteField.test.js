import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, waitFor, within, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardFillObjectDetailsForm from "../components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

const mockOrganisations = [{ name: "Test Organisation" }, { name: "Mock Org" }]

const server = setupServer(
  rest.get("http://api.ror.org/organizations", (req, res, ctx) => {
    const searchTerm = req.url.searchParams.get("query")
    return res(ctx.json({ items: mockOrganisations.filter(item => item.name.toLowerCase().includes(searchTerm)) }))
  })
)

describe("Test autocomplete on organisation field", () => {
  const schema = {
    title: "DAC",
    type: "object",
    properties: {
      organisation: {
        type: "string",
        title: "Organisation",
      },
    },
  }

  const store = mockStore({
    objectType: ObjectTypes.dac,
    submissionType: ObjectSubmissionTypes.form,
    submissionFolder: {
      description: "Test desciption",
      id: "FOL90524783",
      name: "Test name",
      published: false,
    },
  })

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  sessionStorage.setItem(`cached_dac_schema`, JSON.stringify(schema))

  it("should render autocomplete field if schema has 'organisation' property", async () => {
    jest.setTimeout(30000)

    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    await waitFor(() => {
      const autocomplete = screen.getByTestId("organisation")
      expect(autocomplete).toBeDefined()
    })
  })

  it("should search for organisations", async () => {
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )

    const autocomplete = await waitFor(() => screen.getByTestId("organisation"))
    const input = await waitFor(() => within(autocomplete).getByRole("textbox"))
    autocomplete.focus()

    act(() => {
      // Assign value to input field
      userEvent.type(input, "test")
    })

    // Find loading indicator
    await waitFor(() => screen.getByRole("progressbar"))

    // Find options wrapper
    await waitFor(() => screen.getByRole("presentation"))

    // Select first option
    await waitFor(() => userEvent.keyboard("[ArrowDown]"))
    await waitFor(() => userEvent.keyboard("[Enter]"))

    expect(input.value).toEqual(mockOrganisations[0].name)
  })
})
