import { act } from "react"

import { screen, waitFor, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { http } from "msw/http"
import { setupServer } from "msw/node"
import { vi } from "vitest"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"

import { SDObjectTypes } from "constants/wizardObject"
import { corsJsonResponse, renderWithProviders } from "utils/test-utils"

vi.mock("../schemas/submission.json", () => ({
  default: {
    title: "Submission",
    type: "object",
    properties: {
      metadata: {
        type: "object",
        properties: {
          geoLocationPlace: {
            type: "string",
            title: "Geolocation Place",
          },
        },
      },
    },
  },
}))

const mockPlaces = [
  { uri: "http://www.yso.fi/onto/yso/p94137", prefLabel: "Helsinki", vocab: "yso-paikat" },
  // Same concept matched again via an alternative label should be deduplicated
  {
    uri: "http://www.yso.fi/onto/yso/p94137",
    prefLabel: "Helsinki",
    altLabel: "Helsingfors",
    vocab: "yso-paikat",
  },
  { uri: "http://www.yso.fi/onto/yso/p139905", prefLabel: "Helsingborg", vocab: "yso-paikat" },
]

let requestedParams: URLSearchParams | null = null

const server = setupServer(
  http.get("https://api.finto.fi/rest/v1/search", ({ request }) => {
    const url = new URL(request.url)
    requestedParams = url.searchParams
    const searchTerm = (url.searchParams.get("query") as string).replace("*", "").toLowerCase()
    return corsJsonResponse({
      results: mockPlaces.filter(place => place.prefLabel.toLowerCase().startsWith(searchTerm)),
    })
  })
)

describe("Test autocomplete on geoLocationPlace field", () => {
  beforeAll(() => server.listen({ onUnhandledFrame: "bypass" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test("should search places from Finto yso-paikat and select one", async () => {
    act(() => {
      renderWithProviders(<WizardFillObjectDetailsForm />, {
        preloadedState: {
          objectType: SDObjectTypes.publicMetadata,
        },
      })
    })
    const autocomplete = (await waitFor(() =>
      screen.getByTestId("geoLocationPlace-inputField")
    )) as HTMLInputElement
    act(() => {
      autocomplete.focus()
      fireEvent.change(autocomplete, { target: { value: "helsin" } })
    })
    await screen.findByText("Helsingborg")
    expect(screen.getAllByText("Helsinki")).toHaveLength(1)
    expect(requestedParams?.get("vocab")).toEqual("yso-paikat")
    expect(requestedParams?.get("query")).toEqual("helsin*")

    await userEvent.keyboard("{arrowdown}")
    await userEvent.keyboard("{enter}")
    expect(autocomplete.value).toEqual("Helsinki")
  })
})
