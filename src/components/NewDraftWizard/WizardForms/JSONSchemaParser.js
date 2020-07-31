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
        if (property["enum"]) {
          components.push(
            <FormControl key={name}>
              <InputLabel key={`${name}-label`} htmlFor={`${name}-select`}>
                {property["title"]}
              </InputLabel>
              <Field
                key={`${name}-select`}
                component={Select}
                native
                name={name}
                inputProps={{ name: name, id: `${name}-select` }}
              >
                <option
                  key={`${name}-placeholder`}
                  aria-label="None"
                  value="Select stuff"
                />
                {property["enum"].map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Field>
            </FormControl>
          )
        } else {
          components.push(
            <Field
              name={name}
              key={name}
              label={property["title"]}
              component={TextField}
            />
          )
        }
        break
      }
      case "array": {
        const name = `${path}${propertyKey}`
        const itemStructure = traverseValues(property["items"]["properties"])
        components.push(
          <FieldArray name={name} key={name}>
            {({ remove, push }) => (
              <div>
                {values[propertyKey].length > 0 &&
                  values[propertyKey].map((_, index) => (
                    <div key={`${name}.${index}`}>
                      {Object.keys(itemStructure).map(item => (
                        <Field
                          key={`${name}.${index}.${item}`}
                          name={`${name}.${index}.${item}`}
                          label={item}
                          component={TextField}
                        />
                      ))}
                      <Button
                        key={`${name}-${index}-removeButton`}
                        variant="outlined"
                        color="primary"
                        onClick={() => remove(index)}
                      >
                        {`Remove ${propertyKey}`}
                      </Button>
                    </div>
                  ))}
                <Button
                  key="button"
                  variant="outlined"
                  color="primary"
                  onClick={() => push(itemStructure)}
                >
                  {`Add ${propertyKey}`}
                </Button>
              </div>
            )}
          </FieldArray>
        )
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

export default {
  dereferenceSchema,
  buildInitialValues,
  buildFields,
  buildYupSchema,
}
