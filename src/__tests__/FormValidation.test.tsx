import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useForm, FormProvider } from "react-hook-form"
import { vi } from "vitest"

import CSCtheme from "../theme"

import { WizardAjvResolver } from "components/SubmissionWizard/WizardForms/WizardAjvResolver"
import JSONSchemaParser from "components/SubmissionWizard/WizardForms/WizardJSONSchemaParser"
import { FormObject } from "types"
import { renderWithProviders } from "utils/test-utils"

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
  const onSubmit = vi.fn()

  const resolver = WizardAjvResolver(schema, "en")

  beforeEach(() => {
    const FormComponent = () => {
      const methods = useForm({ mode: "onBlur", resolver })

      return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <FormProvider {...methods}>
              <form id="hook-form" onSubmit={onSubmit} role="form">
                <div>{JSONSchemaParser.buildFields(schema as unknown as FormObject)}</div>
                <button type="submit" role="button">
                  submit
                </button>
              </form>
            </FormProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      )
    }

    renderWithProviders(<FormComponent />)
  })

  test("should validate field on blur", async () => {
    const props = schema.properties
    const integerField = screen.getByLabelText(props.integerField.title + " *")
    expect(integerField).toBeInTheDocument()

    await userEvent.type(integerField, "Test value")

    await waitFor(() => {
      integerField.blur()
    })

    expect(screen.getByText("must be integer")).toBeInTheDocument()
  })
})
