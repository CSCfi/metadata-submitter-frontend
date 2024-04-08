import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { act } from "react-dom/test-utils"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"

const mockOrganisations = [{ name: "Test Organisation" }, { name: "Mock Org" }]

const restHandlers = [
  http.get("https://api.ror.org/organizations", ({ request }) => {
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get("query") as string

    return HttpResponse.json({
      items: mockOrganisations.filter(item => item.name.toLowerCase().includes(searchTerm)),
    })
  }),
]

const server = setupServer(...restHandlers)

describe("Test autocomplete on organisation field", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

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

  sessionStorage.setItem(`cached_dac_schema`, JSON.stringify(schema))
  test("should render autocomplete field if schema has 'organisation' property", async () => {
    act(() => {
      renderWithProviders(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
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
        </StyledEngineProvider>
      )
    })
    const autocomplete = (await waitFor(() => screen.getByTestId("organisation-inputField"))) as HTMLInputElement
    act(() => {
      autocomplete.focus()
      // Assign value to autocomplete field
      // Note: userEvent doesn't work inside act(), which in this case is needed for MUI autocomplete field
      fireEvent.change(autocomplete, { target: { value: "test" } })
    })
    //Find loading indicator
    await waitFor(() => screen.getByRole("progressbar"))
    // Find options wrapper
    await waitFor(() => screen.getByRole("presentation"))
    // Select first option
    await waitFor(() => userEvent.keyboard("[ArrowDown]"))
    await waitFor(() => userEvent.keyboard("[Enter]"))
    expect(autocomplete.value).toEqual(mockOrganisations[0].name)
  })
})
