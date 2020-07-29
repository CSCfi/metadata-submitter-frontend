import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field } from "formik"
import React from "react"
import { TextField } from "formik-material-ui"

const buildYupSchema = async schema => {
  try {
    let dereferenced_schema = await $RefParser.dereference(schema)
    delete dereferenced_schema["definitions"]
    return buildYup(dereferenced_schema, {})
  } catch (error) {
    console.error(error)
  }
}

const buildFieldsAndInitialValues = schema => {
  return traverse(schema["properties"])
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
        const name = `${path}${property}`
        console.log(properties[property]["title"])
        components.push(
          <Field
            name={name}
            key={name}
            label={properties[property]["title"]}
            component={TextField}
          />
        )
        break
      }
      default: {
        console.error(`No parsing support for type ${property} yet`)
        break
      }
    }
  }
  return components
}

export default { buildYupSchema, buildFieldsAndInitialValues }
