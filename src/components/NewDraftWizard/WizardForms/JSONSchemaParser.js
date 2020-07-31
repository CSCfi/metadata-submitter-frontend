import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field, FieldArray } from "formik"
import { TextField, Select } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Button from "@material-ui/core/Button"

const dereferenceSchema = async schema => {
  let dereferencedSchema = await $RefParser.dereference(schema)
  delete dereferencedSchema["definitions"]
  return dereferencedSchema
}

const buildYupSchema = async schema => {
  try {
    return buildYup(schema, {})
  } catch (error) {
    console.error(error)
  }
}

const buildInitialValues = schema => {
  return traverseValues(schema["properties"])
}

const traverseValues = properties => {
  let values = {}
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    switch (property["type"]) {
      case "object": {
        values[propertyKey] = traverseValues(property["properties"])
        break
      }
      case "string": {
        values[propertyKey] = ""
        break
      }
      case "array": {
        values[propertyKey] = []
        break
      }
      default: {
        console.error(`No parsing support for type ${property["type"]} yet`)
        break
      }
    }
  }
  return values
}

const buildFields = (schema, values) => {
  return traverseFields(schema["properties"], values)
}

const traverseFields = (properties, values, path = "") => {
  let components = []
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    switch (property["type"]) {
      case "object": {
        components = components.concat(
          traverseFields(
            property["properties"],
            values[propertyKey],
            `${path}${propertyKey}.`
          )
        )
        break
      }
      case "string": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        if (property["enum"]) {
          const component = createSelectField(name, label, property["enum"])
          components.push(component)
        } else {
          const component = createTextField(name, label)
          components.push(component)
        }
        break
      }
      case "array": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        components.push(createArray(name, label, property, values[propertyKey]))
        break
      }
      default: {
        console.error(`No parsing support for type ${property["type"]} yet`)
        break
      }
    }
  }
  return components
}

const createTextField = (name, label) => (
  <Field name={name} key={name} label={label} component={TextField} />
)

const createSelectField = (name, label, options) => (
  <FormControl key={name}>
    <InputLabel key={`${name}-label`} htmlFor={`${name}-select`}>
      {label}
    </InputLabel>
    <Field
      name={name}
      key={`${name}-select`}
      component={Select}
      inputProps={{ name: name, id: `${name}-select` }}
      native
    >
      <option
        key={`${name}-placeholder`}
        aria-label="None"
        value="Select stuff"
      />
      {options.map(option => (
        <option key={`${name}.${option}`} value={option}>
          {option}
        </option>
      ))}
    </Field>
  </FormControl>
)

const createArray = (name, label, property, values) => {
  const itemStructure = traverseValues(property["items"]["properties"])
  return (
    <FieldArray name={name} key={name}>
      {({ remove, push }) => (
        <div>
          {values.length > 0 &&
            values.map((_, index) => (
              <div key={`${name}.${index}`}>
                {Object.keys(itemStructure).map(item =>
                  createTextField(`${name}.${index}.${item}`, item)
                )}
                <Button
                  key={`${name}.${index}-removeButton`}
                  variant="outlined"
                  color="primary"
                  onClick={() => remove(index)}
                >
                  {`Remove ${label}`}
                </Button>
              </div>
            ))}
          <Button
            key="button"
            variant="outlined"
            color="primary"
            onClick={() => push(itemStructure)}
          >
            {`Add ${label}`}
          </Button>
        </div>
      )}
    </FieldArray>
  )
}

export default {
  dereferenceSchema,
  buildInitialValues,
  buildFields,
  buildYupSchema,
}
