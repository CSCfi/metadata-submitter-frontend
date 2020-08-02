import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { Field, FieldArray, useField } from "formik"
import { CheckboxWithLabel, Select, TextField } from "formik-material-ui"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import FormHelperText from "@material-ui/core/FormHelperText"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  fullWidth: {
    width: "100%",
    margin: theme.spacing(1),
  },
}))

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
      case "number": {
        values[propertyKey] = 0
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
    let components = [
      FormHeader(schema["title"], `${schema["title"]}-header`, 1),
    ]
    components.push(...traverseFields(schema["properties"]))
    return components
  } catch (error) {
    console.error(error)
  }
}

const traverseFields = (properties, path = "", level = 2) => {
  let components = []
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    const name = `${path}${propertyKey}`
    const label = property["title"] ? property["title"] : propertyKey
    switch (property["type"]) {
      case "object": {
        components.push(FormHeader(label, name, level))
        components.push(
          ...traverseFields(
            property["properties"],
            `${path}${propertyKey}.`,
            ++level
          )
        )
        break
      }
      case "array": {
        components.push(FormHeader(label, name, level))
        components.push(FormArray(name, label, property))
        break
      }
      default: {
        const component = SolveSuitableComponent(name, label, property)
        if (component) components.push(component)
        break
      }
    }
  }
  return components
}

const SolveSuitableComponent = (name, label, property) => {
  switch (property["type"]) {
    case "string": {
      return property["enum"]
        ? FormSelectField(name, label, property["enum"])
        : FormTextField(name, label)
    }
    case "integer": {
      return FormTextField(name, label)
    }
    case "number": {
      return FormNumberField(name, label)
    }
    case "boolean": {
      return FormBooleanField(name, label)
    }
    default: {
      console.error(`
        No parsing support for type ${property["type"]} yet. 
        Details about this object: 
        `)
      console.error(JSON.stringify(property))
      return null
    }
  }
}

const FormHeader = (text, name, level) => {
  const classes = useStyles()
  level = level > 6 ? 6 : level
  return (
    <Typography
      className={classes.fullWidth}
      variant={`h${level}`}
      key={`${name}-header`}
    >
      {text}
    </Typography>
  )
}

const FormTextField = (name, label) => (
  <Field name={name} key={name} label={label} component={TextField} fullWidth />
)

const FormNumberField = (name, label) => (
  <Field
    name={name}
    key={name}
    label={label}
    type="number"
    component={TextField}
    fullWidth
  />
)

const FormSelectField = (name, label, options) => {
  const [, meta] = useField(name)
  return (
    <FormControl fullWidth key={name} error={meta.touched && !!meta.error}>
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
    fullWidth
  />
)

const FormArray = (name, label, property) => {
  const itemStructure = traverseValues(property["items"]["properties"])
  const [, meta] = useField(name)
  const { value } = meta
  const classes = useStyles()
  return (
    <FieldArray name={name} key={`${name}-array`}>
      {({ remove, push }) => (
        <div className={classes.fullWidth}>
          {value.length > 0 &&
            value.map((_, index) => (
              <div key={`${name}.${index}`}>
                {Object.keys(itemStructure).map(item => {
                  const innerName = `${name}.${index}.${item}`
                  const innerLabel = item
                  const innerProperty = property["items"]["properties"][item]
                  return SolveSuitableComponent(
                    innerName,
                    innerLabel,
                    innerProperty
                  )
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
