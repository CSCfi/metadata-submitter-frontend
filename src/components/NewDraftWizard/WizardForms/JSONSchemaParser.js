import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field } from "formik"
import React from "react"
import { TextField } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import MuiNativeSelect from "@material-ui/core/NativeSelect"

const fieldToNativeSelect = ({
  disabled,
  field: { onBlur: fieldOnBlur, ...field },
  form: { isSubmitting },
  onBlur,
  ...props
}) => ({
  disabled: disabled ?? isSubmitting,
  onBlur:
    onBlur ??
    function (e) {
      fieldOnBlur(e ?? field.name)
    },
  ...field,
  ...props,
})
const NativeSelect = props => (
  <MuiNativeSelect {...fieldToNativeSelect(props)} />
)

const buildYupSchema = async schema => {
  try {
    let dereferenced_schema = await $RefParser.dereference(schema)
    delete dereferenced_schema["definitions"]
    return buildYup(dereferenced_schema, {})
  } catch (error) {
    console.error(error)
  }
}

const buildFieldsAndInitialValues = async schema => {
  let dereferenced_schema = await $RefParser.dereference(schema)
  delete dereferenced_schema["definitions"]
  return traverse(dereferenced_schema["properties"])
}

const traverse = (properties, path = "", components = []) => {
  for (const property in properties) {
    switch (properties[property]["type"]) {
      case "object": {
        components = components.concat(
          traverse(properties[property]["properties"], `${path}${property}.`)
        )
        break
      }
      case "string": {
        if (properties[property]["enum"]) {
          const name = `${path}${property}`
          components.push(
            <FormControl key={name}>
              <InputLabel key={`${name}-label`} htmlFor={`${name}-select`}>
                {properties[property]["title"]}
              </InputLabel>
              <Field
                key={`${name}-select`}
                component={NativeSelect}
                name={name}
                inputProps={{ id: `${name}-select` }}
              >
                {properties[property]["enum"].map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Field>
            </FormControl>
          )
        } else {
          const name = `${path}${property}`
          components.push(
            <Field
              name={name}
              key={name}
              label={properties[property]["title"]}
              component={TextField}
            />
          )
        }
        break
      }
      default: {
        console.error(
          `No parsing support for type ${properties[property]["type"]} yet`
        )
        break
      }
    }
  }
  return components
}

export default { buildYupSchema, buildFieldsAndInitialValues }
