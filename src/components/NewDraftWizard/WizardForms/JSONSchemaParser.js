import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field, FieldArray, useField } from "formik"
import { CheckboxWithLabel, Select, TextField } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import FormHelperText from "@material-ui/core/FormHelperText"
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
  try {
    return traverseValues(schema["properties"])
  } catch (error) {
    console.error(error)
  }
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
      case "integer": {
        values[propertyKey] = ""
        break
      }
      case "boolean": {
        values[propertyKey] = false
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

const buildFields = schema => {
  try {
    return traverseFields(schema["properties"])
  } catch (error) {
    console.error(error)
  }
}

const traverseFields = (properties, path = "") => {
  let components = []
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    switch (property["type"]) {
      case "object": {
        components.push(
          ...traverseFields(property["properties"], `${path}${propertyKey}.`)
        )
        break
      }
      case "string": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        const component = property["enum"]
          ? FormSelectField(name, label, property["enum"])
          : FormTextField(name, label)
        components.push(component)
        break
      }
      case "integer": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        components.push(FormTextField(name, label))
        break
      }
      case "boolean": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        components.push(FormBooleanField(name, label))
        break
      }
      case "array": {
        const name = `${path}${propertyKey}`
        const label = property["title"] ?? propertyKey
        components.push(FormArray(name, label, property))
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

const FormTextField = (name, label) => (
  <Field name={name} key={name} label={label} component={TextField} />
)

const FormSelectField = (name, label, options) => {
  const [, meta] = useField(name)
  return (
    <FormControl key={name} error={meta.touched && !!meta.error}>
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
        <option aria-label="None" value="" disabled />
        {options.map(option => (
          <option key={`${name}.${option}`} value={option}>
            {option}
          </option>
        ))}
      </Field>
      <FormHelperText>{meta.touched && meta.error}</FormHelperText>
    </FormControl>
  )
}

const FormBooleanField = (name, label) => (
  <Field
    name={name}
    key={name}
    type="checkbox"
    component={CheckboxWithLabel}
    Label={{ label: label }}
  />
)

const FormArray = (name, label, property) => {
  const itemStructure = traverseValues(property["items"]["properties"])
  const [, meta] = useField(name)
  const { value } = meta
  return (
    <FieldArray name={name} key={name}>
      {({ remove, push }) => (
        <div>
          {value.length > 0 &&
            value.map((_, index) => (
              <div key={`${name}.${index}`}>
                {Object.keys(itemStructure).map(item => {
                  switch (property["items"]["properties"][item]["type"]) {
                    case "string": {
                      const fieldName = `${name}.${index}.${item}`
                      return property["enum"]
                        ? FormSelectField(fieldName, item, property["enum"])
                        : FormTextField(fieldName, item)
                    }
                    case "integer": {
                      const fieldName = `${name}.${index}.${item}`
                      return FormTextField(fieldName, item)
                    }
                    case "boolean": {
                      const fieldName = `${name}.${index}.${item}`
                      return FormBooleanField(fieldName, item)
                    }
                    default: {
                      return null
                    }
                  }
                })}
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
