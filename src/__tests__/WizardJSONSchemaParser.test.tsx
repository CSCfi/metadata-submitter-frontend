import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { get } from "lodash"
import { useForm, FormProvider } from "react-hook-form"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import CSCtheme from "../theme"

import CustomSchema from "./fixtures/custom_schema.json"

import JSONSchemaParser from "components/SubmissionWizard/WizardForms/WizardJSONSchemaParser"
import { FormObject } from "types"
import { pathToName } from "utils/JSONSchemaUtils"

const mockStore = configureStore([])
const store = mockStore({})

const schema = CustomSchema

describe("Test form render by custom schema", () => {
  beforeEach(() => {
    const FormComponent = () => {
      const methods = useForm()

      return (
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={CSCtheme}>
              <FormProvider {...methods}>
                <form id="hook-form">
                  <div>{JSONSchemaParser.buildFields(schema as unknown as FormObject)}</div>
                </form>
              </FormProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      )
    }

    render(<FormComponent />)
  })

  const testLabels = (source: FormObject) => {
    const properties = source.properties as Record<string, { title: string }>

    for (const key in properties) {
      if (properties[key].title) {
        // Required fields need to be queried with asterisk
        if (source.required && source.required.find((reqProp: string) => reqProp === key)) {
          expect(screen.getByLabelText(properties[key].title + " *")).toBeDefined()
        } else {
          expect(screen.getByLabelText(properties[key].title)).toBeDefined()
        }
      }
    }
  }

  it("should render form by schema", () => {
    let headingCount = 1 // Initial header for schema title
    let buttonCount = 0

    const traverse = (
      object: { title?: string; type?: string; properties: Record<string, unknown> },
      path: string[]
    ) => {
      for (const prop in object.properties) {
        const name = pathToName([...path, prop])
        const source = object.properties[prop] as FormObject

        if (source.properties || source.items?.oneOf) {
          // Eg. Study > Study Description
          headingCount = ++headingCount
        }

        if (source.type === "array" && source.items?.oneOf) {
          // Eg. Study > Study Links
          buttonCount = ++buttonCount
        }

        if (source.enum) {
          // Eg. Study > Study Links > Entrez Link > Database
          expect(screen.getAllByTestId(`${name}-option`)).toHaveLength(
            get(schema.properties, [path[0], "properties", prop, "enum"].join(".")).length
          )
        }

        // Loop through properties recursively
        if (source.properties) traverse(source, [...path, prop])
      }
    }

    traverse(schema, [])

    expect(screen.getAllByRole("heading")).toHaveLength(headingCount)
    expect(screen.getAllByRole("button", { name: "Add new item" })).toHaveLength(buttonCount)
  })

  it("should render fields when clicking 'Add new item' button", async () => {
    // Eg. Study > Study Links
    const addNewItemButton = screen.getByRole("button", { name: "Add new item" })
    await userEvent.click(addNewItemButton)

    const items = schema.properties.arrayFields.properties.oneOfArray.items
    const select = screen.getByLabelText(items.title)
    const selectedItem = items.oneOf[1]
    await userEvent.selectOptions(select, selectedItem.title)

    await waitFor(() => {
      testLabels(selectedItem as unknown as FormObject)
    })
  })

  it("should render option fields when selecting option", async () => {
    // Eg. Study > Study Links > Link Type
    const options = schema.properties.oneOf.properties.oneOfField

    const oneOfSelect = screen.getByLabelText(options.title)
    expect(oneOfSelect).toBeDefined()

    const source = options.oneOf[0]
    await userEvent.selectOptions(oneOfSelect, source.title)

    // OneOf option fields are rendered as required
    const properties = options.oneOf[0].properties as unknown as { [key: string]: { type: string; title: string } }

    for (const key in properties) {
      if (properties[key].title) {
        expect(screen.getByLabelText(properties[key].title + " *")).toBeDefined()
      }
    }
  })
})
