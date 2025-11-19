import { act } from "react"

import { screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { vi } from "vitest"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"

import { SDObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

const mockOrganisations = [
  {
    id: "https://ror.org/01",
    names: [{ lang: "en", types: ["ror_display"], value: "Test organization" }],
  },
  { id: "https://ror.org/02", names: [{ lang: null, types: ["ror_display"], value: "Mock Org" }] },
]

const restHandlers = [
  http.get("https://api.ror.org/organizations", ({ request }) => {
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get("query") as string

    return HttpResponse.json({
      items: mockOrganisations.filter(item =>
        item.names.some(name => name.value.toLowerCase().includes(searchTerm))
      ),
    })
  }),
]

const server = setupServer(...restHandlers)

describe("Test autocomplete on affiliation field", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  vi.mock("../schemas/submission.json", () => ({
    default: {
      title: "Submission",
      type: "object",
      properties: {
        metadata: {
          type: "object",
          properties: {
            affiliation: {
              type: "string",
              title: "Organisation",
            },
          },
        },
      },
    },
  }))

  test("should render autocomplete field if schema has 'affiliation' property", async () => {
    act(() => {
      renderWithProviders(<WizardFillObjectDetailsForm />, {
        preloadedState: {
          objectType: SDObjectTypes.publicMetadata,
        },
      })
    })
    await waitFor(() => {
      const autocomplete = screen.getByTestId("affiliation-inputField")
      expect(autocomplete).toBeDefined()
    })
  })
  test("should search for affiliations", async () => {
    act(() => {
      renderWithProviders(<WizardFillObjectDetailsForm />, {
        preloadedState: {
          objectType: SDObjectTypes.publicMetadata,
        },
      })
    })
    const autocomplete = (await waitFor(() =>
      screen.getByTestId("affiliation-inputField")
    )) as HTMLInputElement
    act(() => {
      autocomplete.focus()
      // Assign value to autocomplete field
      fireEvent.change(autocomplete, { target: { value: "test" } })
    })
    expect(autocomplete.value).toEqual("test")
    //Find loading indicator
    await waitFor(() => screen.getByRole("progressbar"))
    // Find options wrapper
    await waitFor(() => screen.getByRole("presentation"))
    // Wait for dropdown result to appear
    await screen.findByText(mockOrganisations[0].names[0].value)
    // Select first option
    await userEvent.keyboard("{arrowdown}")
    await userEvent.keyboard("{enter}")
    expect(autocomplete.value).toEqual(mockOrganisations[0].names[0].value)
  })
})
