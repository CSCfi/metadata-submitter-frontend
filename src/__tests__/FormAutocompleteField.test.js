import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardFillObjectDetailsForm from "../components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

const mockOrganisations = [{ name: "Test Organisation" }, { name: "Mock Org" }]

// MSWJS tries onUnhandledRequest method, which defaults to GraphQL query if GET call has query params
const server = setupServer(
  rest.get("/organizations", (req, res, ctx) => {
    return res(ctx.json({ ok: true, data: { items: mockOrganisations } }))
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
    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
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
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </Provider>
    )

    server.listen({
      onUnhandledRequest: "warn",
    })

    await waitFor(() => {
      const autocomplete = screen.getByTestId("organisation")
      const input = within(autocomplete).getByRole("textbox")

      autocomplete.focus()
      // assign value to input field
      fireEvent.change(input, { target: { value: "test" } })

      // navigate to the first item in the autocomplete box
      fireEvent.keyDown(autocomplete, { key: "ArrowDown" })

      // select the first item
      fireEvent.keyDown(autocomplete, { key: "Enter" })
      // check the new value of the input field
      expect(input.value).toEqual(mockOrganisations[0].name)
    })
  })
})
