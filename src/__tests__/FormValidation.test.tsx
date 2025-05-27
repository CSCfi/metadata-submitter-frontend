import { fireEvent, screen, waitFor } from "@testing-library/react"
import { useForm, FormProvider } from "react-hook-form"
import { vi } from "vitest"

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
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} role="form">
            <div>{JSONSchemaParser.buildFields(schema as unknown as FormObject)}</div>
            <button type="submit" role="button">
              submit
            </button>
          </form>
        </FormProvider>
      )
    }

    renderWithProviders(<FormComponent />)
  })

  test("should validate field on blur", async () => {
    const integerField = (await waitFor(() =>
      screen.getByTestId("integerField")
    )) as HTMLInputElement
    expect(integerField).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.change(integerField, { target: { value: "Test value" } })
      fireEvent.blur(integerField)
    })
    await waitFor(() => screen.getByText("must be integer"))
  })
})
