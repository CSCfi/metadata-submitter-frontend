import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field, FieldArray } from "formik"
import { TextField, Select } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Button from "@material-ui/core/Button"

const dereferenceSchema = async schema => {
  let dereferenced_schema = await $RefParser.dereference(schema)
  delete dereferenced_schema["definitions"]
  return dereferenced_schema
}

const buildYupSchema = async schema => {
  try {
    return buildYup(schema, {})
  } catch (error) {
    console.error(error)
  }
}

const buildInitialValues = schema => {
  return traverse_values(schema["properties"])
}

const buildFieldsAndInitialValues = (schema, values) => {
  return traverse(schema["properties"], values)
}

const traverse_values = properties => {
  let values = {}
  for (const property in properties) {
    switch (properties[property]["type"]) {
      case "object": {
        values[property] = traverse_values(properties[property]["properties"])
        break
      }
      case "string": {
        values[property] = ""
        break
      }
      case "array": {
        values[property] = []
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
  return values
}

const traverse = (properties, values, path = "", components = []) => {
  for (const property in properties) {
    switch (properties[property]["type"]) {
      case "object": {
        components = components.concat(
          traverse(
            properties[property]["properties"],
            values,
            `${path}${property}.`
          )
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
      case "array": {
        if (property !== "xrefLinks") break
        components.push(
          <FieldArray name="studyLinks.xrefLinks" key={`studyLinks.xrefLinks`}>
            {({ remove, push }) => (
              <div>
                {values.studyLinks.xrefLinks.length > 0 &&
                  values.studyLinks.xrefLinks.map((xRefLink, index) => (
                    <div key={`studyLinks.xrefLinks.${index}`}>
                      <Field
                        name={`studyLinks.xrefLinks.${index}.db`}
                        label="Db"
                        component={TextField}
                      />
                      <Field
                        name={`studyLinks.xrefLinks.${index}.id`}
                        label="Id"
                        component={TextField}
                      />
                      <Button
                        key="button"
                        variant="outlined"
                        color="primary"
                        onClick={() => remove(index)}
                      >
                        Remove this xrefLink
                      </Button>
                    </div>
                  ))}
                <Button
                  key="button"
                  variant="outlined"
                  color="primary"
                  onClick={() => push({ db: "", id: "" })}
                >
                  Add new xrefLink
                </Button>
              </div>
            )}
          </FieldArray>
        )
        //console.log(property)
        //const newComponents = traverse( //  properties[property]["items"]["properties"],
        //  `${path}${property}.`
        //)
        //console.log(newComponents)
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

export default {
  buildInitialValues,
  dereferenceSchema,
  buildYupSchema,
  buildFieldsAndInitialValues,
}
