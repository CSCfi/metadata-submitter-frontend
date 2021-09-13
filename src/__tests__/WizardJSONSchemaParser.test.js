import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm, FormProvider } from "react-hook-form"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import CustomSchema from "./fixtures/custom_schema.json"

import JSONSchemaParser from "components/NewDraftWizard/WizardForms/WizardJSONSchemaParser"

const mockStore = configureStore([])
const store = mockStore({})

const schema = CustomSchema

describe("Test form render by custom schema", () => {
  beforeEach(() => {
    const FormComponent = () => {
      const methods = useForm()

      return (
        <Provider store={store}>
          <FormProvider {...methods}>
            <form id="hook-form">
              <div>{JSONSchemaParser.buildFields(schema)}</div>
            </form>
          </FormProvider>
        </Provider>
      )
    }

    render(<FormComponent />)
  })

  const testLabels = source => {
    const properties = source.properties

    for (const key in properties) {
      if (properties[key].title) {
        // Required fields need to be queried with asterisk
        if (source.required && source.required.find(reqProp => reqProp === key)) {
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

    const traverse = object => {
      for (const prop in object.properties) {
        const source = object.properties[prop]

        if (source.properties || source.items?.oneOf) {
          headingCount = ++headingCount
        }

        if (source.type === "array" && source.items?.oneOf) {
          buttonCount = ++buttonCount
        }

        if (source.properties) testLabels(source)

        if (source.properties) traverse(source)
      }
    }

    traverse(schema)

    expect(screen.getAllByRole("heading")).toHaveLength(headingCount)
    expect(screen.getAllByRole("button", { name: "Add new item" })).toHaveLength(buttonCount)
  })

  it("should render fields when clicking 'Add new item' button", () => {
    const addNewItemButton = screen.getByRole("button", { name: "Add new item" })
    userEvent.click(addNewItemButton)

    const items = schema.properties.arrayFields.properties.oneOfArray.items
    const select = screen.getByLabelText(items.title)
    const selectedItem = items.oneOf[1]
    userEvent.selectOptions(select, selectedItem.title)

    testLabels(selectedItem)
  })

  it("should render option fields when selecting option", () => {
    const options = schema.properties.oneOf.properties.oneOfField

    const oneOfSelect = screen.getByLabelText(options.title)
    expect(oneOfSelect).toBeDefined()

    const source = options.oneOf[0]
    userEvent.selectOptions(oneOfSelect, source.title)

    // OneOf option fields are rendered as required
    const properties = options.oneOf[0].properties

    for (const key in properties) {
      if (properties[key].title) {
        expect(screen.getByLabelText(properties[key].title + " *")).toBeDefined()
      }
    }
  })
})
