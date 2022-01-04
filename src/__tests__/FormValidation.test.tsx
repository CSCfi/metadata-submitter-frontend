import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm, FormProvider } from "react-hook-form"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import { WizardAjvResolver } from "components/NewDraftWizard/WizardForms/WizardAjvResolver"
import JSONSchemaParser from "components/NewDraftWizard/WizardForms/WizardJSONSchemaParser"

const mockStore = configureStore([])
const store = mockStore({})

const schema = {
  title: "Validation schema",
  type: "object",
  required: ["integerField"],
  properties: {
    integerField: {
      title: "Integer Field title",
      type: "integer",
    },
  },
}

describe("Test form render by custom schema", () => {
  const onSubmit = jest.fn()

  const resolver = WizardAjvResolver(schema, "en")

  beforeEach(() => {
    const FormComponent = () => {
      const methods = useForm({ mode: "onBlur", resolver })

      return (
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <FormProvider {...methods}>
                <form id="hook-form" onSubmit={onSubmit} role="form">
                  <div>{JSONSchemaParser.buildFields(schema)}</div>
                  <button type="submit" role="button">
                    submit
                  </button>
                </form>
              </FormProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      )
    }

    render(<FormComponent />)
  })

  it("should validate field on blur", async () => {
    const props = schema.properties
    const integerField = screen.getByLabelText(props.integerField.title + " *")
    expect(integerField).toBeInTheDocument()

    userEvent.type(integerField, "Test value")

    await waitFor(() => {
      integerField.blur()
    })

    expect(screen.getByText("must be integer")).toBeInTheDocument()
  })
})
