import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, waitFor, fireEvent } from "@testing-library/react"
//import userEvent from "@testing-library/user-event"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { act } from "react-dom/test-utils"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

const mockOrganisations = [{ name: "Test Organisation" }, { name: "Mock Org" }]

const server = setupServer(
  rest.get("https://api.ror.org/organizations", (req, res, ctx) => {
    const searchTerm = req.url.searchParams.get("query") as string
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

  const preloadedState = {
    objectType: ObjectTypes.dac,
    submissionType: ObjectSubmissionTypes.form,
    submission: {
      description: "Test desciption",
      submissionId: "FOL90524783",
      name: "Test name",
      published: false,
      workflow: "FEGA",
      drafts: [],
      metadataObjects: [],
      doiInfo: { creators: [], contributors: [], subjects: [] },
    },
    openedXMLModal: false,
  }

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  sessionStorage.setItem(`cached_dac_schema`, JSON.stringify(schema))

  test("should render autocomplete field if schema has 'organisation' property", async () => {
    jest.setTimeout(30000)
    act(() => {
      renderWithProviders(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>,
        { preloadedState }
      )
    })
    await waitFor(() => {
      const autocomplete = screen.getByTestId("organisation-inputField")
      expect(autocomplete).toBeDefined()
    })
  })

  test("should search for organisations", async () => {
    act(() => {
      renderWithProviders(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>,
        { preloadedState }
      )
    })
    const autocomplete = (await waitFor(() => screen.getByTestId("organisation-inputField"))) as HTMLInputElement

    act(() => {
      autocomplete.focus()
      // Assign value to autocomplete field
      // Note: userEvent doesn't work inside act(), which in this case is needed for MUI autocomplete field
      fireEvent.change(autocomplete, { target: { value: "test" } })
    })
    // Find loading indicator
    //await waitFor(() => screen.getByRole("progressbar"))
    //// Find options wrapper
    //await waitFor(() => screen.getByRole("presentation"))
    //// Select first option
    //await waitFor(() => userEvent.keyboard("[ArrowDown]"))
    //await waitFor(() => userEvent.keyboard("[Enter]"))
    //expect(autocomplete.value).toEqual(mockOrganisations[0].name)
  })
})
